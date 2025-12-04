import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseSchema, generateId, saveToLocalStorage, loadFromLocalStorage } from './schemaParser';
import type { Table, Relation } from '../types';

describe('parseSchema', () => {
  it('should parse a simple table with basic fields', () => {
    const schema = `
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('users');
    expect(tables[0].fields).toHaveLength(3);
    expect(tables[0].fields[0]).toEqual({
      name: 'id',
      type: 'INT',
      isPrimary: true,
    });
    expect(relations).toHaveLength(0);
  });

  it('should parse multiple tables', () => {
    const schema = `
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
      );
      
      CREATE TABLE posts (
        id INT PRIMARY KEY,
        title VARCHAR(255)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(2);
    expect(tables[0].name).toBe('users');
    expect(tables[1].name).toBe('posts');
    expect(relations).toHaveLength(0);
  });

  it('should parse foreign key relationships', () => {
    const schema = `
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
      );
      
      CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(2);
    expect(relations).toHaveLength(1);
    expect(relations[0]).toEqual({
      from: 'posts',
      to: 'users',
      fromField: 'user_id',
      toField: 'id',
      name: 'user_id → users.id',
    });

    const postsTable = tables.find((t) => t.name === 'posts');
    const userIdField = postsTable?.fields.find((f) => f.name === 'user_id');
    expect(userIdField?.isForeign).toBe(true);
    expect(userIdField?.references).toEqual({
      table: 'users',
      field: 'id',
    });
  });

  it('should handle multiple foreign keys in a single table', () => {
    const schema = `
      CREATE TABLE comments (
        id INT PRIMARY KEY,
        post_id INT,
        user_id INT,
        content TEXT,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    expect(relations).toHaveLength(2);

    const postRelation = relations.find((r) => r.toField === 'id' && r.to === 'posts');
    const userRelation = relations.find((r) => r.toField === 'id' && r.to === 'users');

    expect(postRelation).toBeDefined();
    expect(userRelation).toBeDefined();
    expect(postRelation?.fromField).toBe('post_id');
    expect(userRelation?.fromField).toBe('user_id');
  });

  it('should handle composite primary keys', () => {
    const schema = `
      CREATE TABLE user_roles (
        user_id INT,
        role_id INT,
        assigned_at TIMESTAMP,
        PRIMARY KEY (user_id, role_id)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    const table = tables[0];

    const userIdField = table.fields.find((f) => f.name === 'user_id');
    const roleIdField = table.fields.find((f) => f.name === 'role_id');
    const assignedAtField = table.fields.find((f) => f.name === 'assigned_at');

    expect(userIdField?.isPrimary).toBe(true);
    expect(roleIdField?.isPrimary).toBe(true);
    expect(assignedAtField?.isPrimary).toBe(false);
  });

  it('should handle different data types', () => {
    const schema = `
      CREATE TABLE products (
        id INT PRIMARY KEY,
        name VARCHAR(255),
        price DECIMAL(10,2),
        quantity INT,
        description TEXT,
        created_at TIMESTAMP,
        is_active BOOLEAN
      );
    `;

    const { tables } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    const fields = tables[0].fields;

    expect(fields.find((f) => f.name === 'id')?.type).toBe('INT');
    expect(fields.find((f) => f.name === 'name')?.type).toBe('VARCHAR(255)');
    expect(fields.find((f) => f.name === 'price')?.type).toBe('DECIMAL(10,2)');
    expect(fields.find((f) => f.name === 'description')?.type).toBe('TEXT');
    expect(fields.find((f) => f.name === 'created_at')?.type).toBe('TIMESTAMP');
    expect(fields.find((f) => f.name === 'is_active')?.type).toBe('BOOLEAN');
  });
  it('should handle case-insensitive SQL keywords', () => {
    const schema = `
      create table TestTable (
        id int primary key,
        name varchar(255),
        foreign key (id) references OtherTable(id)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('TestTable');
    expect(relations).toHaveLength(1);
  });

  it('should return empty arrays for invalid or empty schema', () => {
    const schema = '';
    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(0);
    expect(relations).toHaveLength(0);
  });

  it('should handle schema with extra whitespace and newlines', () => {
    const schema = `
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
      );
    `;

    const { tables } = parseSchema(schema);

    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('users');
    expect(tables[0].fields).toHaveLength(2);
  });

  it('should handle complex schema with multiple relationships', () => {
    const schema = `
      CREATE TABLE users (
        id INT PRIMARY KEY,
        username VARCHAR(50),
        email VARCHAR(255)
      );
      
      CREATE TABLE categories (
        id INT PRIMARY KEY,
        name VARCHAR(100)
      );
      
      CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        category_id INT,
        title VARCHAR(255),
        content TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      
      CREATE TABLE comments (
        id INT PRIMARY KEY,
        post_id INT,
        user_id INT,
        content TEXT,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const { tables, relations } = parseSchema(schema);

    expect(tables).toHaveLength(4);
    expect(relations).toHaveLength(4);

    // Check posts has 2 foreign keys
    const postsTable = tables.find((t) => t.name === 'posts');
    const foreignFields = postsTable?.fields.filter((f) => f.isForeign);
    expect(foreignFields).toHaveLength(2);

    // Check comments has 2 foreign keys
    const commentsTable = tables.find((t) => t.name === 'comments');
    const commentForeignFields = commentsTable?.fields.filter((f) => f.isForeign);
    expect(commentForeignFields).toHaveLength(2);
  });
});

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id3).toBeTruthy();
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate a string ID', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate IDs without spaces or special characters', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe('saveToLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should save data to localStorage', () => {
    const key = 'testKey';
    const data = { name: 'Test', value: 123 };

    saveToLocalStorage(key, data);

    const saved = localStorage.getItem(key);
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual(data);
  });

  it('should save string data', () => {
    const key = 'stringKey';
    const data = 'Hello World';

    saveToLocalStorage(key, data);

    const saved = localStorage.getItem(key);
    expect(JSON.parse(saved!)).toBe(data);
  });

  it('should save array data', () => {
    const key = 'arrayKey';
    const data = [1, 2, 3, 4, 5];

    saveToLocalStorage(key, data);

    const saved = localStorage.getItem(key);
    expect(JSON.parse(saved!)).toEqual(data);
  });

  it('should save null value', () => {
    const key = 'nullKey';
    const data = null;

    saveToLocalStorage(key, data);

    const saved = localStorage.getItem(key);
    expect(JSON.parse(saved!)).toBeNull();
  });

  it('should overwrite existing data in localStorage', () => {
    const key = 'testKey';
    const data1 = { value: 1 };
    const data2 = { value: 2 };

    saveToLocalStorage(key, data1);
    saveToLocalStorage(key, data2);

    const saved = localStorage.getItem(key);
    expect(JSON.parse(saved!)).toEqual(data2);
  });
});

describe('loadFromLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should load data from localStorage', () => {
    const key = 'testKey';
    const data = { name: 'Test', value: 123 };
    localStorage.setItem(key, JSON.stringify(data));

    const loaded = loadFromLocalStorage(key, {});

    expect(loaded).toEqual(data);
  });

  it('should return default value if key does not exist', () => {
    const key = 'nonExistentKey';
    const defaultValue = { default: true };

    const loaded = loadFromLocalStorage(key, defaultValue);

    expect(loaded).toEqual(defaultValue);
  });

  it('should load array data', () => {
    const key = 'arrayKey';
    const data = [1, 2, 3, 4, 5];
    localStorage.setItem(key, JSON.stringify(data));

    const loaded = loadFromLocalStorage(key, []);

    expect(loaded).toEqual(data);
  });

  it('should load string data', () => {
    const key = 'stringKey';
    const data = 'Hello World';
    localStorage.setItem(key, JSON.stringify(data));

    const loaded = loadFromLocalStorage(key, '');

    expect(loaded).toBe(data);
  });

  it('should return default value on parse error', () => {
    const key = 'invalidKey';
    const defaultValue = { default: true };
    localStorage.setItem(key, 'invalid json {{{');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const loaded = loadFromLocalStorage(key, defaultValue);

    expect(loaded).toEqual(defaultValue);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load from localStorage:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle boolean values correctly', () => {
    const key = 'boolKey';
    const trueValue = true;
    const falseValue = false;

    saveToLocalStorage(key, trueValue);
    let loaded = loadFromLocalStorage(key, false);
    expect(loaded).toBe(true);

    saveToLocalStorage(key, falseValue);
    loaded = loadFromLocalStorage(key, true);
    expect(loaded).toBe(false);
  });

  it('should use correct type from generic parameter', () => {
    interface TestType {
      id: number;
      name: string;
    }

    const key = 'typedKey';
    const data: TestType = { id: 1, name: 'Test' };
    const defaultValue: TestType = { id: 0, name: 'Default' };

    localStorage.setItem(key, JSON.stringify(data));

    const loaded = loadFromLocalStorage<TestType>(key, defaultValue);

    expect(loaded.id).toBe(1);
    expect(loaded.name).toBe('Test');
  });
});
