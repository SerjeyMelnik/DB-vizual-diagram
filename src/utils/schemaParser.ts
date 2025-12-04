import type { Table, Relation, Field } from '../types';

// Regex patterns extracted as constants for better performance
// These are compiled once and reused across all parseSchema calls
const TABLE_REGEX = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\)\s*;/gi;
const FOREIGN_KEY_REGEX = /FOREIGN\s+KEY\s*\((\w+)\)\s+REFERENCES\s+(\w+)\s*\((\w+)\)/i;
const PRIMARY_KEY_LINE_REGEX = /PRIMARY\s+KEY\s*\(/i;
const PRIMARY_KEY_EXTRACT_REGEX = /PRIMARY\s+KEY\s*\(([^)]+)\)/i;
const FIELD_DEFINITION_REGEX = /^(\w+)\s+([\w]+(?:\s*\([^)]+\))?)/i;
const INLINE_PRIMARY_KEY_REGEX = /PRIMARY\s+KEY/i;

/**
 * Parses a SQL schema string and extracts tables and relations
 */
export function parseSchema(schemaString: string): {
  tables: Table[];
  relations: Relation[];
} {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  // Reset regex state
  TABLE_REGEX.lastIndex = 0;

  let match;

  while ((match = TABLE_REGEX.exec(schemaString)) !== null) {
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
      const fkMatch = line.match(FOREIGN_KEY_REGEX);
      if (fkMatch) {
        foreignKeys.push({
          field: fkMatch[1],
          refTable: fkMatch[2],
          refField: fkMatch[3],
        });
        continue;
      }

      // Check for PRIMARY KEY constraint (separate line)
      if (PRIMARY_KEY_LINE_REGEX.test(line)) {
        const pkMatch = line.match(PRIMARY_KEY_EXTRACT_REGEX);
        if (pkMatch) {
          const pkFields = pkMatch[1].split(',').map((f) => f.trim());
          // Optimize: use a Set only when beneficial (multiple primary keys)
          if (pkFields.length > 1) {
            const pkFieldSet = new Set(pkFields);
            for (let i = 0; i < fields.length; i++) {
              if (pkFieldSet.has(fields[i].name)) {
                fields[i].isPrimary = true;
              }
            }
          } else if (pkFields.length === 1) {
            // Single primary key - direct comparison
            for (let i = 0; i < fields.length; i++) {
              if (fields[i].name === pkFields[0]) {
                fields[i].isPrimary = true;
                break;
              }
            }
          }
        }
        continue;
      }

      // Parse field definition
      const fieldMatch = line.match(FIELD_DEFINITION_REGEX);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];

        const isPrimary = INLINE_PRIMARY_KEY_REGEX.test(line);

        fields.push({
          name: fieldName,
          type: fieldType,
          isPrimary,
        });
      }
    }

    // Add foreign key information to fields and create relations
    // Optimize: use Map only when there are multiple foreign keys
    if (foreignKeys.length > 0) {
      if (foreignKeys.length > 3) {
        // Use Map for faster lookups when there are many foreign keys
        const fieldMap = new Map(fields.map((f) => [f.name, f]));

        for (let i = 0; i < foreignKeys.length; i++) {
          const fk = foreignKeys[i];
          const field = fieldMap.get(fk.field);

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
        }
      } else {
        // Direct array search for few foreign keys
        for (let i = 0; i < foreignKeys.length; i++) {
          const fk = foreignKeys[i];

          for (let j = 0; j < fields.length; j++) {
            if (fields[j].name === fk.field) {
              fields[j].isForeign = true;
              fields[j].references = {
                table: fk.refTable,
                field: fk.refField,
              };
              break;
            }
          }

          relations.push({
            from: tableName,
            to: fk.refTable,
            fromField: fk.field,
            toField: fk.refField,
            name: `${fk.field} → ${fk.refTable}.${fk.refField}`,
          });
        }
      }
    }

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
