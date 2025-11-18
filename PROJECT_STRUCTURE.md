# Database Visualizer - Project Structure

## Overview

A React-based database schema visualizer that allows users to input SQL CREATE TABLE statements and visualize table relationships in an interactive diagram.

## Features

- ✅ Parse SQL schema from text input
- ✅ Interactive ReactFlow diagram with draggable nodes
- ✅ Automatic foreign key detection and relationship visualization
- ✅ Multiple schema management (save, load, switch, delete)
- ✅ LocalStorage persistence
- ✅ Example schemas included
- ✅ Primary key (PK) and Foreign key (FK) indicators

## Project Structure

```
src/
├── components/           # React components
│   ├── Visualizer.tsx   # Main ReactFlow diagram component
│   ├── TableNode.tsx    # Custom node for table visualization
│   └── Sidebar.tsx      # Schema editor and management sidebar
│
├── types/               # TypeScript type definitions
│   └── index.ts         # Field, Table, Relation, DatabaseSchema types
│
├── constants/           # Application constants
│   └── index.ts         # Example schemas, storage keys, templates
│
├── utils/               # Utility functions
│   ├── schemaParser.ts  # SQL parser, localStorage helpers, ID generator
│   └── layoutUtils.ts   # Layout calculation utilities
│
├── App.tsx              # Main application component with state management
├── App.css              # Application styles
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Key Components

### 1. **Visualizer.tsx**

- Renders the ReactFlow diagram
- Manages nodes (tables) and edges (relationships)
- Handles drag and drop, zoom, pan
- Shows empty state when no tables

### 2. **TableNode.tsx**

- Custom ReactFlow node component
- Displays table name, fields, and data types
- Shows PK (Primary Key) and FK (Foreign Key) tags
- Styled with Ant Design Card

### 3. **Sidebar.tsx**

- Schema selection dropdown
- SQL text editor (TextArea)
- Create, save, delete schema actions
- Display schema metadata (table count, relation count)
- Load example template

### 4. **App.tsx**

- Main application state management
- Schema CRUD operations
- LocalStorage integration
- Connects Sidebar and Visualizer components

## Type Definitions

### Field

```typescript
{
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: { table: string; field: string; };
}
```

### Table

```typescript
{
  id: string;
  name: string;
  fields: Field[];
}
```

### Relation

```typescript
{
  from: string; // Source table
  to: string; // Target table
  fromField: string; // Foreign key field
  toField: string; // Referenced field
  name: string; // Display label
}
```

### DatabaseSchema

```typescript
{
  id: string;
  name: string;
  description?: string;
  schema: string;         // Raw SQL text
  tables: Table[];
  relations: Relation[];
  createdAt: string;
}
```

## Utility Functions

### schemaParser.ts

- `parseSchema(schemaString)`: Parse SQL CREATE TABLE statements
- `generateId()`: Generate unique IDs
- `saveToLocalStorage()`: Save data to localStorage
- `loadFromLocalStorage()`: Load data from localStorage

### layoutUtils.ts

- `calculateTableLayout()`: Calculate grid positions for tables

## SQL Schema Format

The parser supports standard SQL CREATE TABLE syntax:

```sql
CREATE TABLE table_name (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  other_field_id INT,
  FOREIGN KEY (other_field_id) REFERENCES other_table(id)
);
```

### Supported Features:

- ✅ Column definitions with data types
- ✅ PRIMARY KEY constraints (inline or separate)
- ✅ FOREIGN KEY constraints with REFERENCES
- ✅ Multiple foreign keys per table
- ✅ Composite primary keys

## Data Flow

1. User enters/selects SQL schema in Sidebar
2. User clicks "Save & Visualize"
3. `parseSchema()` extracts tables and relations
4. App state updates with parsed data
5. Visualizer receives tables and relations as props
6. ReactFlow renders interactive diagram
7. Changes saved to localStorage automatically

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **ReactFlow (@xyflow/react)** - Interactive diagrams
- **Ant Design** - UI components
- **Vite** - Build tool

## Future Enhancements

- [ ] Export diagram as image (PNG/SVG)
- [ ] Import from actual database connections
- [ ] Custom color schemes for different table types
- [ ] Search/filter tables
- [ ] Minimap for large schemas
- [ ] Undo/redo functionality
- [ ] Auto-layout algorithms (dagre, elk)
- [ ] Dark mode support
