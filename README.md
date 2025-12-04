# DB Visual Diagram

A modern database schema visualization tool built with React, TypeScript, and Vite. Create, edit, and visualize database schemas with an intuitive drag-and-drop interface.

## 🚀 Features

- **Schema Editor**: Write SQL CREATE TABLE statements with syntax highlighting
- **Visual Diagram**: Interactive visualization of database tables and relationships
- **Drag & Drop**: Rearrange tables with smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Multiple Schemas**: Create and manage multiple database schemas
- **Auto-Save**: Automatic persistence to localStorage
- **Example Schemas**: Pre-loaded example schemas to get started

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Ant Design** - UI component library
- **XYFlow (React Flow)** - Diagram visualization
- **Zustand** - State management
- **ESLint + Prettier** - Code quality

## 📦 State Management

This project uses **Zustand** for global state management:

- **Simple API**: Hook-based, no boilerplate
- **Type-Safe**: Full TypeScript support
- **Persistent**: Automatic localStorage sync
- **Performance**: Fine-grained reactivity

See [ZUSTAND_GUIDE.md](./ZUSTAND_GUIDE.md) for usage examples and best practices.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Top navigation bar
│   ├── Sidebar.tsx     # SQL editor sidebar
│   ├── TableNode.tsx   # Individual table node
│   └── Visualizer.tsx  # Main diagram canvas
├── store/              # Zustand state management
│   └── useAppStore.ts  # Global app store
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── layoutUtils.ts  # Diagram layout logic
│   └── schemaParser.ts # SQL parsing
├── constants/          # App constants
│   └── index.ts
└── App.tsx             # Main app component
```

## 🎨 Usage

1. **Create a Schema**: Click "New Schema" and give it a name
2. **Write SQL**: Enter CREATE TABLE statements in the sidebar
3. **Visualize**: Click "Save & Visualize" to see your diagram
4. **Customize**: Drag tables to rearrange, toggle dark mode
5. **Manage**: Switch between schemas, delete, or load examples

### Example SQL

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔧 Configuration

### ESLint (Type-Aware Linting)

For production applications, enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // or tseslint.configs.strictTypeChecked
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

## 📚 Documentation

- [Zustand Quick Reference](./ZUSTAND_GUIDE.md) - State management guide
- [Migration Guide](./ZUSTAND_MIGRATION.md) - Details on Zustand integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Ant Design](https://ant.design/) - UI components
- [XYFlow](https://xyflow.com/) - Diagram library
- [Zustand](https://zustand.docs.pmnd.rs/) - State management
- [Vite](https://vite.dev/) - Build tool
