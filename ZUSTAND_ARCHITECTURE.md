# Zustand State Flow Architecture

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zustand Store                           │
│                    (src/store/useAppStore.ts)                   │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                          │
│  • theme: 'light' | 'dark'                                      │
│  • schemas: DatabaseSchema[]                                    │
│  • currentSchemaId: string | null                               │
│  • schemaText: string                                           │
│                                                                  │
│  Actions:                                                        │
│  • toggleTheme()                                                │
│  • createSchema(name, text)                                     │
│  • updateSchema(id, text)                                       │
│  • deleteSchema(id)                                             │
│  • changeSchema(id)                                             │
│  • loadExampleSchemas()                                         │
│                                                                  │
│  Getters:                                                        │
│  • getCurrentSchema()                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ (Persistent to localStorage)
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  localStorage   │     │   Components    │
│  'db-visualizer'│     │   (Subscribe)   │
└─────────────────┘     └────────┬────────┘
                                 │
                     ┌───────────┴───────────┬──────────────┬──────────────┐
                     │                       │              │              │
                     ▼                       ▼              ▼              ▼
            ┌────────────────┐     ┌─────────────┐  ┌──────────┐  ┌──────────────┐
            │   Header.tsx   │     │ Sidebar.tsx │  │ App.tsx  │  │Visualizer.tsx│
            ├────────────────┤     ├─────────────┤  ├──────────┤  ├──────────────┤
            │ Uses:          │     │ Uses:       │  │ Uses:    │  │ Uses:        │
            │ • schemas      │     │ • schemaText│  │ • schemas│  │ • theme      │
            │ • theme        │     │ • setSch... │  │ • getCur.│  └──────────────┘
            │ • currentSch...│     └─────────────┘  └──────────┘
            │ • toggleTheme()│              │              │              │
            │ • createSch... │              │              │              │
            │ • updateSch... │              │              │              │
            │ • deleteSch... │              │              │              │
            └────────────────┘              │              │              │
                     │                      │              │              │
                     └──────────────────────┴──────────────┴──────────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │   TableNode.tsx       │
                                ├───────────────────────┤
                                │ Uses:                 │
                                │ • theme               │
                                └───────────────────────┘
```

## Component State Usage

### App.tsx

```typescript
const schemas = useAppStore((state) => state.schemas);
const loadExampleSchemas = useAppStore((state) => state.loadExampleSchemas);
const getCurrentSchema = useAppStore((state) => state.getCurrentSchema);
const setSchemaText = useAppStore((state) => state.setSchemaText);
```

**Purpose**: Root component, initializes schemas, passes data to children

### Header.tsx

```typescript
const schemas = useAppStore((state) => state.schemas);
const currentSchemaId = useAppStore((state) => state.currentSchemaId);
const schemaText = useAppStore((state) => state.schemaText);
const theme = useAppStore((state) => state.theme);
const toggleTheme = useAppStore((state) => state.toggleTheme);
const createSchema = useAppStore((state) => state.createSchema);
const updateSchema = useAppStore((state) => state.updateSchema);
const deleteSchema = useAppStore((state) => state.deleteSchema);
const changeSchema = useAppStore((state) => state.changeSchema);
```

**Purpose**: Main navigation, schema CRUD operations, theme toggle

### Sidebar.tsx

```typescript
const schemaText = useAppStore((state) => state.schemaText);
const setSchemaText = useAppStore((state) => state.setSchemaText);
```

**Purpose**: SQL editor, updates schema text in real-time

### Visualizer.tsx

```typescript
const theme = useAppStore((state) => state.theme);
```

**Purpose**: Renders diagram canvas, uses theme for styling

### TableNode.tsx

```typescript
const theme = useAppStore((state) => state.theme);
```

**Purpose**: Individual table cards, uses theme for styling

### main.tsx (ThemedApp)

```typescript
const theme = useAppStore((state) => state.theme);
```

**Purpose**: Wraps app with Ant Design ConfigProvider, applies theme globally

## Data Flow Examples

### Example 1: Creating a New Schema

```
User clicks "New Schema" button
         ↓
Header.tsx calls createSchema(name, text)
         ↓
Zustand Store:
  - Generates new schema with unique ID
  - Parses SQL text to extract tables & relations
  - Adds schema to schemas array
  - Sets currentSchemaId to new schema
  - Updates schemaText
         ↓
Persistence: Saves to localStorage
         ↓
Components re-render:
  - Header: Updates dropdown with new schema
  - Sidebar: Shows new schema text
  - Visualizer: Displays new diagram
```

### Example 2: Toggling Theme

```
User clicks theme toggle switch
         ↓
Header.tsx calls toggleTheme()
         ↓
Zustand Store:
  - Switches theme: 'light' → 'dark' or 'dark' → 'light'
  - Updates document.body.backgroundColor
         ↓
Persistence: Saves theme to localStorage
         ↓
All components using theme re-render:
  - main.tsx: Updates ConfigProvider algorithm
  - Header: Updates header background color
  - Visualizer: Updates canvas background
  - TableNode: Updates card colors
```

### Example 3: Editing Schema Text

```
User types in SQL editor
         ↓
Sidebar.tsx calls setSchemaText(newText)
         ↓
Zustand Store:
  - Updates schemaText state
         ↓
Persistence: Saves to localStorage
         ↓
Sidebar re-renders with new text
(Note: Diagram doesn't update until "Save & Visualize" is clicked)
```

### Example 4: Saving & Visualizing

```
User clicks "Save & Visualize" button
         ↓
Header.tsx calls updateSchema(currentSchemaId, schemaText)
         ↓
Zustand Store:
  - Parses schemaText to extract tables & relations
  - Updates schema in schemas array
  - Keeps currentSchemaId and schemaText unchanged
         ↓
Persistence: Saves to localStorage
         ↓
Components re-render:
  - Visualizer: Receives updated tables & relations, re-renders diagram
  - Header: Shows updated table/relation counts
```

## Benefits of This Architecture

### 🎯 Single Source of Truth

- All state lives in one place
- No prop drilling needed
- Easy to debug and trace state changes

### ⚡ Performance

- Components only re-render when their selected state changes
- Fine-grained subscriptions prevent unnecessary renders
- Zustand uses shallow comparison for optimal performance

### 💾 Automatic Persistence

- State automatically syncs to localStorage
- Survives page refreshes
- No manual save/load logic needed

### 🔧 Easy Testing

- Mock store for tests
- Access state without component wrapper
- Predictable state updates

### 📝 Type Safety

- Full TypeScript support
- Autocomplete for all state and actions
- Compile-time error checking

### 🚀 Developer Experience

- Simple API, no boilerplate
- Use hooks anywhere in component tree
- No provider wrapping needed
- DevTools support available

## Migration Impact

### Before (Context API + useState)

```
┌─────────────┐
│   App.tsx   │ (10+ useState hooks)
└──────┬──────┘
       │ (Props drilling)
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
  ┌────────┐   ┌──────────┐   ┌──────────┐
  │Header  │   │Sidebar   │   │Visualizer│
  │(10props)   │(2 props) │   │(2 props) │
  └────────┘   └──────────┘   └──────────┘
```

### After (Zustand)

```
┌─────────────────┐
│ Zustand Store   │ (All state centralized)
└────────┬────────┘
         │ (Hook subscriptions)
         ├─────────────┬─────────────┐
         ▼             ▼             ▼
    ┌────────┐   ┌──────────┐   ┌──────────┐
    │Header  │   │Sidebar   │   │Visualizer│
    │(1 prop)│   │(0 props) │   │(2 props) │
    └────────┘   └──────────┘   └──────────┘
```

**Reduction:**

- App.tsx: 10+ useState → 0 useState
- Header: 10 props → 1 prop
- Sidebar: 2 props → 0 props
- Total lines of code: ~40% reduction in state management code
