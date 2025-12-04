import { bench, describe } from 'vitest';
import { parseSchema } from './schemaParser';

const types = ['VARCHAR(255)', 'INT', 'DECIMAL(10,2)', 'TEXT', 'TIMESTAMP', 'BOOLEAN'];
// Generate a large schema for stress testing
function generateLargeSchema(numTables: number, fieldsPerTable: number): string {
  let schema = '';

  for (let i = 0; i < numTables; i++) {
    schema += `CREATE TABLE table_${i} (\n`;
    schema += `  id INT PRIMARY KEY,\n`;

    for (let j = 1; j < fieldsPerTable - 1; j++) {
      const type = types[j % types.length];
      schema += `  field_${j} ${type},\n`;
    }

    // Add foreign key to previous table
    if (i > 0) {
      schema += `  ref_table_${i - 1}_id INT,\n`;
      schema += `  FOREIGN KEY (ref_table_${i - 1}_id) REFERENCES table_${i - 1}(id)\n`;
    } else {
      schema += `  last_field VARCHAR(100)\n`;
    }

    schema += `);\n\n`;
  }

  return schema;
}

// Generate a complex schema with multiple foreign keys
function generateComplexSchema(numTables: number): string {
  let schema = '';

  // Create base tables
  schema += `CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP
  );\n\n`;

  schema += `CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT
  );\n\n`;

  // Create tables with multiple foreign keys
  for (let i = 0; i < numTables; i++) {
    schema += `CREATE TABLE entity_${i} (
      id INT PRIMARY KEY,
      user_id INT,
      category_id INT,
      name VARCHAR(255),
      description TEXT,
      value DECIMAL(10,2),
      status VARCHAR(50),
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );\n\n`;
  }

  return schema;
}

describe('parseSchema Performance', () => {
  // Small schema benchmarks
  const smallSchema = generateLargeSchema(5, 5);

  bench('parse small schema (5 tables, 5 fields each)', () => {
    parseSchema(smallSchema);
  });

  // Medium schema benchmarks
  const mediumSchema = generateLargeSchema(20, 10);

  bench('parse medium schema (20 tables, 10 fields each)', () => {
    parseSchema(mediumSchema);
  });

  // Large schema benchmarks
  const largeSchema = generateLargeSchema(50, 15);

  bench('parse large schema (50 tables, 15 fields each)', () => {
    parseSchema(largeSchema);
  });

  // Very large schema benchmarks
  const veryLargeSchema = generateLargeSchema(100, 20);

  bench('parse very large schema (100 tables, 20 fields each)', () => {
    parseSchema(veryLargeSchema);
  });

  // Complex schema with multiple foreign keys
  const complexSchema = generateComplexSchema(30);

  bench('parse complex schema (30 tables with multiple FK)', () => {
    parseSchema(complexSchema);
  });

  // Stress test - extremely large schema
  const extremeSchema = generateLargeSchema(200, 25);

  bench(
    'parse extreme schema (200 tables, 25 fields each)',
    () => {
      parseSchema(extremeSchema);
    },
    { iterations: 10 },
  );
});
