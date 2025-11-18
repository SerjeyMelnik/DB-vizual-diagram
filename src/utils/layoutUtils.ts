import type { Table } from '../types';

/**
 * Calculate automatic layout positions for tables in a grid-like structure
 */
export function calculateTableLayout(
  tables: Table[],
  config: {
    horizontalSpacing?: number;
    verticalSpacing?: number;
    tablesPerRow?: number;
  } = {},
): Array<{ id: string; x: number; y: number }> {
  const { horizontalSpacing = 350, verticalSpacing = 350, tablesPerRow = 3 } = config;

  return tables.map((table, index) => ({
    id: table.id,
    x: (index % tablesPerRow) * horizontalSpacing,
    y: Math.floor(index / tablesPerRow) * verticalSpacing,
  }));
}
