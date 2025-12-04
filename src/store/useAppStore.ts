import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DatabaseSchema } from '../types';
import { parseSchema, generateId } from '../utils/schemaParser';
import { EXAMPLE_SCHEMAS } from '../constants';

type Theme = 'light' | 'dark';

interface AppState {
  // Theme state
  theme: Theme;
  toggleTheme: () => void;

  // Schema state
  schemas: DatabaseSchema[];
  currentSchemaId: string | null;
  schemaText: string;

  // Schema actions
  setSchemas: (schemas: DatabaseSchema[]) => void;
  setCurrentSchemaId: (id: string | null) => void;
  setSchemaText: (text: string) => void;

  createSchema: (name: string, schemaText: string) => void;
  updateSchema: (schemaId: string, schemaText: string) => void;
  deleteSchema: (schemaId: string) => void;
  changeSchema: (schemaId: string) => void;
  loadExampleSchemas: () => void;

  // Computed getters
  getCurrentSchema: () => DatabaseSchema | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial theme state
      theme: 'light',

      // Initial schema state
      schemas: [],
      currentSchemaId: null,
      schemaText: '',

      // Theme actions
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Update body background
          document.body.style.backgroundColor = newTheme === 'dark' ? '#141414' : '#f0f2f5';
          return { theme: newTheme };
        });
      },

      // Schema actions
      setSchemas: (schemas) => set({ schemas }),

      setCurrentSchemaId: (id) => set({ currentSchemaId: id }),

      setSchemaText: (text) => set({ schemaText: text }),

      createSchema: (name, schemaText) => {
        const { tables, relations } = parseSchema(schemaText);
        const newSchema: DatabaseSchema = {
          id: generateId(),
          name,
          schema: schemaText,
          tables,
          relations,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          schemas: [...state.schemas, newSchema],
          currentSchemaId: newSchema.id,
          schemaText,
        }));
      },

      updateSchema: (schemaId, schemaText) => {
        const { tables, relations } = parseSchema(schemaText);
        set((state) => ({
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId ? { ...schema, schema: schemaText, tables, relations } : schema,
          ),
          schemaText,
        }));
      },

      deleteSchema: (schemaId) => {
        set((state) => {
          const updatedSchemas = state.schemas.filter((schema) => schema.id !== schemaId);
          const nextSchema = updatedSchemas[0];

          return {
            schemas: updatedSchemas,
            currentSchemaId: nextSchema?.id || null,
            schemaText: nextSchema?.schema || '',
          };
        });
      },

      changeSchema: (schemaId) => {
        const schema = get().schemas.find((s) => s.id === schemaId);
        if (schema) {
          set({
            currentSchemaId: schemaId,
            schemaText: schema.schema,
          });
        }
      },

      loadExampleSchemas: () => {
        const parsedExamples = EXAMPLE_SCHEMAS.map((schema) => {
          const { tables, relations } = parseSchema(schema.schema);
          return { ...schema, tables, relations };
        });

        set({
          schemas: parsedExamples,
          currentSchemaId: parsedExamples[0]?.id || null,
          schemaText: parsedExamples[0]?.schema || '',
        });
      },

      // Computed getters
      getCurrentSchema: () => {
        const { schemas, currentSchemaId } = get();
        return schemas.find((s) => s.id === currentSchemaId);
      },
    }),
    {
      name: 'db-visualizer-storage',
      partialize: (state) => ({
        theme: state.theme,
        schemas: state.schemas,
        currentSchemaId: state.currentSchemaId,
        schemaText: state.schemaText,
      }),
    },
  ),
);
