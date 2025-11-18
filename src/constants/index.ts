import type { DatabaseSchema } from '../types';

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
