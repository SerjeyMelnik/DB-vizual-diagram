import type { Table, Relation, Field } from '../types';

/**
 * Parses a SQL schema string and extracts tables and relations
 */
export function parseSchema(schemaString: string): {
  tables: Table[];
  relations: Relation[];
} {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(schemaString)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];

    const fields: Field[] = [];
    const foreignKeys: Array<{ field: string; refTable: string; refField: string }> = [];

    // Split by comma, but be careful with nested parentheses
    const lines = tableBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      // Check for FOREIGN KEY constraint
      const fkMatch = line.match(/FOREIGN\s+KEY\s*\((\w+)\)\s+REFERENCES\s+(\w+)\s*\((\w+)\)/i);
      if (fkMatch) {
        foreignKeys.push({
          field: fkMatch[1],
          refTable: fkMatch[2],
          refField: fkMatch[3],
        });
        continue;
      }

      // Check for PRIMARY KEY constraint (separate line)
      if (/PRIMARY\s+KEY\s*\(/i.test(line)) {
        const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          const pkFields = pkMatch[1].split(',').map((f) => f.trim());
          fields.forEach((field) => {
            if (pkFields.includes(field.name)) {
              field.isPrimary = true;
            }
          });
        }
        continue;
      }

      // Parse field definition
      const fieldMatch = line.match(/^(\w+)\s+([\w()]+(?:\s*\(\d+(?:,\d+)?\))?)/i);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];

        const isPrimary = /PRIMARY\s+KEY/i.test(line);

        fields.push({
          name: fieldName,
          type: fieldType,
          isPrimary,
        });
      }
    }

    // Add foreign key information to fields and create relations
    foreignKeys.forEach((fk) => {
      const field = fields.find((f) => f.name === fk.field);
      if (field) {
        field.isForeign = true;
        field.references = {
          table: fk.refTable,
          field: fk.refField,
        };
      }

      relations.push({
        from: tableName,
        to: fk.refTable,
        fromField: fk.field,
        toField: fk.refField,
        name: `${fk.field} → ${fk.refTable}.${fk.refField}`,
      });
    });

    tables.push({
      id: tableName,
      name: tableName,
      fields,
    });
  }

  return { tables, relations };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Save schemas to localStorage
 */
export function saveToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load schemas from localStorage
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}
