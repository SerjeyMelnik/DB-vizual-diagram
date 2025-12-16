import type { Table } from '../types';

/**
 * Calculate automatic layout positions for tables in a grid-like structure
 * with adaptive spacing based on table field counts
 *
 * @param tables - Array of tables to layout
 * @param config - Layout configuration options
 * @returns Array of positions with id, x, and y coordinates
 */
export function calculateTableLayout(
  tables: Table[],
  config: {
    horizontalSpacing?: number;
    verticalSpacing?: number;
    tablesPerRow?: number;
  } = {},
): Array<{ id: string; x: number; y: number }> {
  const { horizontalSpacing = 400, verticalSpacing = 450, tablesPerRow = 3 } = config;

  // Early return for empty tables
  if (tables.length === 0) return [];

  // Pre-calculate field counts to avoid repeated access
  const fieldCounts = tables.map((t) => t.fields.length);

  // Pre-allocate array with known size for better performance
  const positions: Array<{ id: string; x: number; y: number }> = new Array(tables.length);

  let currentY = 0;
  const totalRows = Math.ceil(tables.length / tablesPerRow);

  // Process each row at once instead of checking row changes in loop
  for (let row = 0; row < totalRows; row++) {
    const rowStart = row * tablesPerRow;
    const rowEnd = Math.min(rowStart + tablesPerRow, tables.length);

    // Calculate max fields in current row
    let maxFieldsInRow = 0;
    for (let i = rowStart; i < rowEnd; i++) {
      if (fieldCounts[i] > maxFieldsInRow) {
        maxFieldsInRow = fieldCounts[i];
      }
    }

    // Position all tables in this row
    for (let i = rowStart; i < rowEnd; i++) {
      const column = i % tablesPerRow;
      positions[i] = {
        id: tables[i].id,
        x: column * horizontalSpacing,
        y: currentY,
      };
    }

    // Calculate row height for next iteration
    // Base spacing + additional per field (roughly 40px per field + header + padding)
    const rowHeight = Math.max(verticalSpacing, 120 + maxFieldsInRow * 45);
    currentY += rowHeight;
  }

  return positions;
}
