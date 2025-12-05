/**
 * Extreme stress testing for schema parser
 * Tests with 5000+ tables and measures performance
 */

import { parseSchema } from './schemaParser';
import { SchemaParserWorker } from './schemaParserWorker';

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
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const startTime = performance.now();

  const result = parseSchema(schema);

  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

  return {
    tableCount: result.tables.length,
    fieldCount: result.tables.reduce((sum, t) => sum + t.fields.length, 0),
    relationCount: result.relations.length,
    executionTime: endTime - startTime,
    memoryUsed: endMemory - startMemory,
  };
}

/**
 * Run WebWorker parser test
 */
async function testWorkerParser(schema: string): Promise<TestResult> {
  const worker = new SchemaParserWorker();
  const startTime = performance.now();

  const result = await worker.parseSchema(schema);

  const endTime = performance.now();

  return {
    tableCount: result.tables.length,
    fieldCount: result.tables.reduce((sum, t) => sum + t.fields.length, 0),
    relationCount: result.relations.length,
    executionTime: result.executionTime || endTime - startTime,
  };
}

/**
 * Run comprehensive stress tests
 */
export async function runStressTests() {
  console.log('='.repeat(80));
  console.log('SCHEMA PARSER EXTREME STRESS TEST');
  console.log('='.repeat(80));
  console.log('');

  const testSizes = [100, 500, 1000, 2500, 5000];
  const results: {
    size: number;
    sync: TestResult;
    worker: TestResult;
  }[] = [];

  for (const size of testSizes) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Testing with ${size} tables...`);
    console.log('─'.repeat(80));

    // Generate schema
    console.log('Generating schema...');
    const schema = generateLargeSchema(size);
    const schemaSizeKB = (new Blob([schema]).size / 1024).toFixed(2);
    console.log(`Schema size: ${schemaSizeKB} KB`);

    // Test synchronous parser
    console.log('\nRunning synchronous parser...');
    const syncResult = testSyncParser(schema);
    console.log(`✓ Completed in ${syncResult.executionTime.toFixed(2)}ms`);
    console.log(`  Tables: ${syncResult.tableCount}`);
    console.log(`  Fields: ${syncResult.fieldCount}`);
    console.log(`  Relations: ${syncResult.relationCount}`);
    if (syncResult.memoryUsed) {
      console.log(`  Memory: ${(syncResult.memoryUsed / 1024 / 1024).toFixed(2)} MB`);
    }

    // Test WebWorker parser
    console.log('\nRunning WebWorker parser...');
    const workerResult = await testWorkerParser(schema);
    console.log(`✓ Completed in ${workerResult.executionTime.toFixed(2)}ms`);
    console.log(`  Tables: ${workerResult.tableCount}`);
    console.log(`  Fields: ${workerResult.fieldCount}`);
    console.log(`  Relations: ${workerResult.relationCount}`);

    // Calculate performance difference
    const improvement =
      ((syncResult.executionTime - workerResult.executionTime) / syncResult.executionTime) * 100;
    console.log(
      `\n⚡ Performance: ${improvement > 0 ? 'WebWorker faster' : 'Sync faster'} by ${Math.abs(improvement).toFixed(2)}%`,
    );

    results.push({
      size,
      sync: syncResult,
      worker: workerResult,
    });

    // Give browser time to clean up
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Print summary report
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('PERFORMANCE SUMMARY REPORT');
  console.log('='.repeat(80));
  console.log('');
  console.log('Tables | Sync (ms) | Worker (ms) | Improvement | Sync Mem (MB)');
  console.log('-'.repeat(80));

  results.forEach(({ size, sync, worker }) => {
    const improvement = ((sync.executionTime - worker.executionTime) / sync.executionTime) * 100;
    const memStr = sync.memoryUsed ? (sync.memoryUsed / 1024 / 1024).toFixed(2) : 'N/A';
    console.log(
      `${size.toString().padEnd(6)} | ` +
        `${sync.executionTime.toFixed(2).padEnd(9)} | ` +
        `${worker.executionTime.toFixed(2).padEnd(11)} | ` +
        `${improvement.toFixed(2).padEnd(11)}% | ` +
        `${memStr}`,
    );
  });

  // Calculate averages
  const avgSyncTime = results.reduce((sum, r) => sum + r.sync.executionTime, 0) / results.length;
  const avgWorkerTime =
    results.reduce((sum, r) => sum + r.worker.executionTime, 0) / results.length;
  const avgImprovement = ((avgSyncTime - avgWorkerTime) / avgSyncTime) * 100;

  console.log('-'.repeat(80));
  console.log(`Average improvement: ${avgImprovement.toFixed(2)}%`);
  console.log('');

  // Recommendations
  console.log('RECOMMENDATIONS:');
  console.log('─'.repeat(80));
  if (avgImprovement > 10) {
    console.log('✓ WebWorker provides significant performance improvement');
    console.log('  Recommended for schemas with 1000+ tables');
  } else if (avgImprovement > 0) {
    console.log('✓ WebWorker provides moderate improvement');
    console.log('  Consider using for schemas with 2500+ tables');
  } else {
    console.log('⚠ WebWorker overhead may not be worth it for typical schemas');
    console.log('  Stick with synchronous parser for better performance');
  }
  console.log('');
  console.log('OPTIMIZATIONS APPLIED:');
  console.log('─'.repeat(80));
  console.log('✓ Replaced regex.test() with string.includes() for faster checks');
  console.log('✓ Pre-compiled string constants to avoid repeated allocations');
  console.log('✓ Adaptive algorithm: Map for many FKs, direct search for few');
  console.log('✓ WebWorker implementation for non-blocking parsing');
  console.log('');
  console.log('For C++ optimization, consider:');
  console.log('- WebAssembly (WASM) module for core parsing logic');
  console.log('- Emscripten to compile C++ regex/string parser');
  console.log('- Expected 2-5x improvement for very large schemas (10k+ tables)');
  console.log('');
  console.log('='.repeat(80));

  return results;
}

// Export for direct usage
export { generateLargeSchema, testSyncParser, testWorkerParser };
