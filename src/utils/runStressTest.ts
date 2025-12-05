/**
 * Direct Node.js test runner for schema parser stress testing
 * Run with: tsx src/utils/runStressTest.ts
 */

import { parseSchema } from './schemaParser';

interface TestResult {
  tableCount: number;
  fieldCount: number;
  relationCount: number;
  executionTime: number;
  memoryUsed?: number;
}

/**
 * Generate a large SQL schema with specified number of tables
 */
function generateLargeSchema(tableCount: number): string {
  const schemas: string[] = [];
  const fieldsPerTable = 10;
  const relationsPerTable = 3;

  // Base tables without foreign keys
  for (let i = 0; i < Math.min(100, tableCount); i++) {
    const fields: string[] = [];
    fields.push(`id INT PRIMARY KEY`);

    for (let j = 1; j < fieldsPerTable; j++) {
      const fieldName = `field_${j}`;
      const types = ['INT', 'VARCHAR(255)', 'TEXT', 'DECIMAL(10,2)', 'DATETIME', 'BOOLEAN'];
      const type = types[j % types.length];
      fields.push(`${fieldName} ${type}`);
    }

    schemas.push(`CREATE TABLE table_${i} (\n  ${fields.join(',\n  ')}\n);`);
  }

  // Tables with foreign keys
  for (let i = 100; i < tableCount; i++) {
    const fields: string[] = [];
    fields.push(`id INT PRIMARY KEY`);

    for (let j = 1; j < fieldsPerTable; j++) {
      const fieldName = `field_${j}`;
      const types = ['INT', 'VARCHAR(255)', 'TEXT', 'DECIMAL(10,2)', 'DATETIME', 'BOOLEAN'];
      const type = types[j % types.length];
      fields.push(`${fieldName} ${type}`);
    }

    // Add foreign key fields and constraints
    const foreignKeys: string[] = [];
    for (let k = 0; k < relationsPerTable; k++) {
      const refTableId = Math.floor(Math.random() * Math.min(i, 100));
      const fkFieldName = `ref_table_${refTableId}_id`;
      fields.push(`${fkFieldName} INT`);
      foreignKeys.push(`FOREIGN KEY (${fkFieldName}) REFERENCES table_${refTableId}(id)`);
    }

    schemas.push(`CREATE TABLE table_${i} (\n  ${fields.concat(foreignKeys).join(',\n  ')}\n);`);
  }

  return schemas.join('\n\n');
}

/**
 * Run synchronous parser test
 */
function testSyncParser(schema: string): TestResult {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;

  const result = parseSchema(schema);

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed;

  return {
    tableCount: result.tables.length,
    fieldCount: result.tables.reduce((sum, t) => sum + t.fields.length, 0),
    relationCount: result.relations.length,
    executionTime: endTime - startTime,
    memoryUsed: endMemory - startMemory,
  };
}

/**
 * Run comprehensive stress tests
 */
async function runStressTests() {
  console.log('='.repeat(80));
  console.log('SCHEMA PARSER EXTREME STRESS TEST');
  console.log('Optimizations: regex.test() → string.includes()');
  console.log('='.repeat(80));
  console.log('');

  const testSizes = [100, 500, 1000, 2500, 5000, 7500, 10000];
  const results: {
    size: number;
    result: TestResult;
    schemaSize: number;
  }[] = [];

  for (const size of testSizes) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Testing with ${size} tables...`);
    console.log('─'.repeat(80));

    // Generate schema
    console.log('Generating schema...');
    const schema = generateLargeSchema(size);
    const schemaSize = Buffer.byteLength(schema, 'utf8');
    const schemaSizeKB = (schemaSize / 1024).toFixed(2);
    console.log(`Schema size: ${schemaSizeKB} KB`);

    // Warm up run
    parseSchema(schema);

    // Test synchronous parser (3 runs for average)
    console.log('\nRunning optimized parser (3 runs)...');
    const runs: TestResult[] = [];

    for (let i = 0; i < 3; i++) {
      const result = testSyncParser(schema);
      runs.push(result);
      console.log(`  Run ${i + 1}: ${result.executionTime.toFixed(2)}ms`);
    }

    // Calculate average
    const avgResult: TestResult = {
      tableCount: runs[0].tableCount,
      fieldCount: runs[0].fieldCount,
      relationCount: runs[0].relationCount,
      executionTime: runs.reduce((sum, r) => sum + r.executionTime, 0) / runs.length,
      memoryUsed: runs.reduce((sum, r) => sum + (r.memoryUsed || 0), 0) / runs.length,
    };

    console.log(`\n✓ Average: ${avgResult.executionTime.toFixed(2)}ms`);
    console.log(`  Tables parsed: ${avgResult.tableCount}`);
    console.log(`  Fields parsed: ${avgResult.fieldCount}`);
    console.log(`  Relations found: ${avgResult.relationCount}`);
    console.log(`  Memory used: ${(avgResult.memoryUsed! / 1024 / 1024).toFixed(2)} MB`);
    console.log(
      `  Throughput: ${((avgResult.tableCount / avgResult.executionTime) * 1000).toFixed(0)} tables/sec`,
    );

    results.push({
      size,
      result: avgResult,
      schemaSize,
    });

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  // Print summary report
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('PERFORMANCE SUMMARY REPORT');
  console.log('='.repeat(80));
  console.log('');
  console.log('Tables | Time (ms) | Memory (MB) | Throughput (t/s) | Schema (KB)');
  console.log('-'.repeat(80));

  results.forEach(({ size, result, schemaSize }) => {
    const throughput = ((result.tableCount / result.executionTime) * 1000).toFixed(0);
    const memMB = (result.memoryUsed! / 1024 / 1024).toFixed(2);
    const schemaKB = (schemaSize / 1024).toFixed(2);

    console.log(
      `${size.toString().padEnd(6)} | ` +
        `${result.executionTime.toFixed(2).padEnd(9)} | ` +
        `${memMB.padEnd(11)} | ` +
        `${throughput.padEnd(16)} | ` +
        `${schemaKB}`,
    );
  });

  console.log('-'.repeat(80));

  // Performance analysis
  console.log('');
  console.log('PERFORMANCE ANALYSIS:');
  console.log('─'.repeat(80));

  const small = results[0]; // 100 tables
  const large = results[results.length - 1]; // 10000 tables

  const scalingFactor = large.result.executionTime / small.result.executionTime;
  const tableFactor = large.size / small.size;
  const efficiency = ((tableFactor / scalingFactor) * 100).toFixed(1);

  console.log(`Scaling efficiency: ${efficiency}%`);
  console.log(`  100 tables: ${small.result.executionTime.toFixed(2)}ms`);
  console.log(`  ${large.size} tables: ${large.result.executionTime.toFixed(2)}ms`);
  console.log(`  ${tableFactor}x more tables → ${scalingFactor.toFixed(2)}x slower`);
  console.log('');

  console.log('OPTIMIZATIONS APPLIED:');
  console.log('─'.repeat(80));
  console.log('✓ Replaced regex.test() with string.includes() for PRIMARY KEY checks');
  console.log('✓ Replaced regex.test() with string.includes() for FOREIGN KEY checks');
  console.log('✓ Pre-compiled string constants to avoid repeated allocations');
  console.log('✓ Adaptive algorithm: Map for many FKs (>3), direct search for few');
  console.log('✓ Single primary key uses early break instead of full iteration');
  console.log('');

  console.log('RECOMMENDATIONS:');
  console.log('─'.repeat(80));

  if (large.result.executionTime < 5000) {
    console.log('✓ Excellent performance! Parser handles 10k tables in under 5 seconds');
  } else if (large.result.executionTime < 10000) {
    console.log('✓ Good performance for most use cases');
  } else {
    console.log('⚠ Consider WebWorker for schemas with 5000+ tables');
  }

  console.log('');
  console.log('NEXT STEPS FOR FURTHER OPTIMIZATION:');
  console.log('─'.repeat(80));
  console.log('1. WebWorker: Offload parsing to separate thread (already implemented)');
  console.log('2. WebAssembly (C++):');
  console.log('   - Compile C++ parser with Emscripten');
  console.log('   - Expected 2-5x improvement for very large schemas');
  console.log('   - Best for 10k+ tables or real-time parsing');
  console.log('3. Incremental parsing: Parse only visible tables');
  console.log('4. Schema caching: Cache parsed results with hash');
  console.log('');
  console.log('='.repeat(80));

  return results;
}

// Run tests
runStressTests().catch(console.error);
