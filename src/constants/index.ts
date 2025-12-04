import type { DatabaseSchema } from '../types';

/**
 * Generate a synthetic stress test schema with configurable number of tables
 */
function generateStressTestSchema(numTables: number = 30): string {
  let schema = '';
  const dataTypes = ['VARCHAR(100)', 'INT', 'DECIMAL(10,2)', 'TEXT', 'TIMESTAMP', 'BOOLEAN'];
  const tableCategories = [
    {
      prefix: 'entity',
      fields: ['name', 'description', 'status', 'value', 'created_at', 'updated_at'],
    },
    { prefix: 'record', fields: ['title', 'content', 'priority', 'assignee', 'due_date'] },
    { prefix: 'item', fields: ['label', 'category', 'quantity', 'price', 'active'] },
    { prefix: 'data', fields: ['key', 'value', 'type', 'metadata', 'timestamp'] },
  ];

  // Create base tables first (to reference later)
  schema += `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  parent_id INT,
  description TEXT,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

`;

  // Generate dynamic tables with relationships
  for (let i = 0; i < numTables; i++) {
    const category = tableCategories[i % tableCategories.length];
    const tableName = `${category.prefix}_${i}`;

    schema += `CREATE TABLE ${tableName} (\n`;
    schema += `  id INT PRIMARY KEY,\n`;

    // Add category fields
    category.fields.forEach((field, idx) => {
      const dataType = dataTypes[idx % dataTypes.length];
      schema += `  ${field} ${dataType},\n`;
    });

    // Add foreign key to users
    schema += `  user_id INT,\n`;

    // Add foreign key to categories
    schema += `  category_id INT,\n`;

    // Add foreign key to previous table (if not first)
    if (i > 0) {
      const prevCategory = tableCategories[(i - 1) % tableCategories.length];
      const prevTableName = `${prevCategory.prefix}_${i - 1}`;
      schema += `  parent_${prevTableName}_id INT,\n`;
      schema += `  FOREIGN KEY (parent_${prevTableName}_id) REFERENCES ${prevTableName}(id),\n`;
    }

    schema += `  FOREIGN KEY (user_id) REFERENCES users(id),\n`;
    schema += `  FOREIGN KEY (category_id) REFERENCES categories(id)\n`;
    schema += `);\n\n`;
  }

  // Add junction tables for many-to-many relationships
  const junctionCount = Math.min(5, Math.floor(numTables / 6));
  for (let i = 0; i < junctionCount; i++) {
    const table1Idx = i * 6;
    const table2Idx = i * 6 + 3;
    const cat1 = tableCategories[table1Idx % tableCategories.length];
    const cat2 = tableCategories[table2Idx % tableCategories.length];
    const tableName1 = `${cat1.prefix}_${table1Idx}`;
    const tableName2 = `${cat2.prefix}_${table2Idx}`;

    schema += `CREATE TABLE ${tableName1}_${tableName2} (
  ${tableName1}_id INT,
  ${tableName2}_id INT,
  created_at TIMESTAMP,
  PRIMARY KEY (${tableName1}_id, ${tableName2}_id),
  FOREIGN KEY (${tableName1}_id) REFERENCES ${tableName1}(id),
  FOREIGN KEY (${tableName2}_id) REFERENCES ${tableName2}(id)
);

`;
  }

  return schema;
}

export const EXAMPLE_SCHEMAS: DatabaseSchema[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce Database',
    description: 'A typical e-commerce database schema',
    createdAt: new Date().toISOString(),
    schema: `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);`,
    tables: [],
    relations: [],
  },
  {
    id: 'blog',
    name: 'Blog Database',
    description: 'A simple blog database schema',
    createdAt: new Date().toISOString(),
    schema: `CREATE TABLE authors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  bio TEXT
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(200),
  content TEXT,
  author_id INT,
  published_at TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY,
  post_id INT,
  author_name VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE tags (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE post_tags (
  post_id INT,
  tag_id INT,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);`,
    tables: [],
    relations: [],
  },
  {
    id: 'stress-test',
    name: 'Stress Test Schema (30 Tables)',
    description: 'Synthetically generated large schema to test performance and layout',
    createdAt: new Date().toISOString(),
    schema: generateStressTestSchema(30),
    tables: [],
    relations: [],
  },
  {
    id: 'stress-test-large',
    name: 'Extreme Stress Test (50 Tables)',
    description: 'Very large synthetically generated schema for extreme stress testing',
    createdAt: new Date().toISOString(),
    schema: generateStressTestSchema(50),
    tables: [],
    relations: [],
  },
];

export const STORAGE_KEY = 'db-visualizer-schemas';

export const DEFAULT_SCHEMA_TEMPLATE = `-- Example: Create your database schema

CREATE TABLE table_name (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  created_at TIMESTAMP
);

-- Add foreign keys to create relations
-- FOREIGN KEY (column_name) REFERENCES other_table(id)
`;
