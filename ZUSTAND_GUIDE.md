# Zustand Quick Reference Guide

## 📦 What is Zustand?

Zustand is a lightweight state management library for React that provides:

- Simple, hook-based API
- No boilerplate code
- Built-in TypeScript support
- Automatic persistence to localStorage
- Better performance than Context API

## 🎯 Store Location

**Main Store**: `src/store/useAppStore.ts`

## 🔧 Basic Usage

### Import the Store

```typescript
import { useAppStore } from '../store/useAppStore';
```

### Read State (in components)

```typescript
function MyComponent() {
  // Select specific state
  const theme = useAppStore((state) => state.theme);
  const schemas = useAppStore((state) => state.schemas);
  const currentSchemaId = useAppStore((state) => state.currentSchemaId);

  return <div>Current theme: {theme}</div>;
}
```

### Call Actions (in components)

```typescript
function MyComponent() {
  // Select actions
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const createSchema = useAppStore((state) => state.createSchema);
  const updateSchema = useAppStore((state) => state.updateSchema);

  const handleCreate = () => {
    createSchema('My Schema', 'CREATE TABLE users...');
  };

  return (
    <button onClick={toggleTheme}>Toggle Theme</button>
    <button onClick={handleCreate}>Create Schema</button>
  );
}
```

### Use Computed Getters

```typescript
function MyComponent() {
  const getCurrentSchema = useAppStore((state) => state.getCurrentSchema);
  const currentSchema = getCurrentSchema();

  return <div>{currentSchema?.name}</div>;
}
```

## 📊 Available State

### Theme State

- `theme`: Current theme ('light' | 'dark')

### Schema State

- `schemas`: Array of all database schemas
- `currentSchemaId`: ID of currently selected schema
- `schemaText`: Current SQL text in editor

## ⚡ Available Actions

### Theme Actions

```typescript
toggleTheme(); // Switches between light and dark mode
```

### Schema Management Actions

```typescript
// Set state directly (rarely needed)
setSchemas(schemas: DatabaseSchema[])
setCurrentSchemaId(id: string | null)
setSchemaText(text: string)

// CRUD operations (recommended)
createSchema(name: string, schemaText: string)
updateSchema(schemaId: string, schemaText: string)
deleteSchema(schemaId: string)
changeSchema(schemaId: string)
loadExampleSchemas()
```

### Computed Getters

```typescript
getCurrentSchema(); // Returns current schema or undefined
```

## 💡 Best Practices

### 1. Select Only What You Need

```typescript
// ❌ Don't select the entire state
const state = useAppStore((state) => state);

// ✅ Select only what you need
const theme = useAppStore((state) => state.theme);
const createSchema = useAppStore((state) => state.createSchema);
```

### 2. Multiple Selectors for Multiple Values

```typescript
// ✅ Good - multiple selectors
function MyComponent() {
  const theme = useAppStore((state) => state.theme);
  const schemas = useAppStore((state) => state.schemas);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  // ...
}
```

### 3. Combine Related Selectors (if needed)

```typescript
// For complex derived state
const schemaInfo = useAppStore((state) => ({
  schemas: state.schemas,
  currentId: state.currentSchemaId,
  text: state.schemaText,
}));
```

## 🔍 Debugging

### Access Store Outside Components

```typescript
// In browser console or anywhere
import { useAppStore } from './store/useAppStore';

// Get current state
useAppStore.getState();

// Update state
useAppStore.setState({ theme: 'dark' });

// Subscribe to changes
useAppStore.subscribe(console.log);
```

### Check Persisted State

```typescript
// In browser console
localStorage.getItem('db-visualizer-storage');
```

## 🎨 Common Patterns

### Pattern 1: Simple State Access

```typescript
function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### Pattern 2: Form with Store

```typescript
function SchemaEditor() {
  const schemaText = useAppStore((state) => state.schemaText);
  const setSchemaText = useAppStore((state) => state.setSchemaText);

  return (
    <textarea
      value={schemaText}
      onChange={(e) => setSchemaText(e.target.value)}
    />
  );
}
```

### Pattern 3: List Operations

```typescript
function SchemaList() {
  const schemas = useAppStore((state) => state.schemas);
  const deleteSchema = useAppStore((state) => state.deleteSchema);

  return (
    <ul>
      {schemas.map((schema) => (
        <li key={schema.id}>
          {schema.name}
          <button onClick={() => deleteSchema(schema.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### Pattern 4: Conditional Rendering

```typescript
function SchemaDetails() {
  const getCurrentSchema = useAppStore((state) => state.getCurrentSchema);
  const currentSchema = getCurrentSchema();

  if (!currentSchema) {
    return <div>No schema selected</div>;
  }

  return (
    <div>
      <h2>{currentSchema.name}</h2>
      <p>Tables: {currentSchema.tables.length}</p>
    </div>
  );
}
```

## 🚀 Performance Tips

1. **Shallow Equality**: Zustand uses shallow comparison by default
2. **Selector Optimization**: Only select what you need to minimize re-renders
3. **Memoization**: Zustand automatically optimizes selector results
4. **No Provider Needed**: No wrapper components, use hooks anywhere

## 📝 TypeScript Support

The store is fully typed. TypeScript will:

- Autocomplete all state properties
- Autocomplete all actions
- Show type errors for invalid usage
- Provide intellisense in VS Code

## 🔗 State Persistence

State is automatically saved to localStorage:

- **Key**: `db-visualizer-storage`
- **What's saved**: theme, schemas, currentSchemaId, schemaText
- **When**: Automatically on every state change
- **Restoration**: Automatic on app load

## ❓ FAQ

**Q: Can I use multiple stores?**
A: Yes! Create additional stores with `create()`. Current app uses one store.

**Q: How do I reset the store?**
A: Clear localStorage or call `useAppStore.setState(initialState)`

**Q: Can I use Zustand outside React?**
A: Yes! Use `useAppStore.getState()` and `useAppStore.setState()`

**Q: Is it production ready?**
A: Yes! Zustand is used by many production applications.

## 📚 Learn More

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
