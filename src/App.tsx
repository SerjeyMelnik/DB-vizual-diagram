import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { useState, useEffect } from 'react';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import type { DatabaseSchema } from './types';
import { EXAMPLE_SCHEMAS, STORAGE_KEY } from './constants';
import {
  parseSchema,
  generateId,
  saveToLocalStorage,
  loadFromLocalStorage,
} from './utils/schemaParser';
import './App.css';

function App() {
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [currentSchemaId, setCurrentSchemaId] = useState<string | null>(null);

  // Load schemas from localStorage on mount
  useEffect(() => {
    const savedSchemas = loadFromLocalStorage<DatabaseSchema[]>(STORAGE_KEY, []);

    if (savedSchemas.length === 0) {
      // Initialize with example schemas if no saved schemas exist
      const parsedExamples = EXAMPLE_SCHEMAS.map((schema) => {
        const { tables, relations } = parseSchema(schema.schema);
        return { ...schema, tables, relations };
      });
      setSchemas(parsedExamples);
      setCurrentSchemaId(parsedExamples[0]?.id || null);
      saveToLocalStorage(STORAGE_KEY, parsedExamples);
    } else {
      setSchemas(savedSchemas);
      setCurrentSchemaId(savedSchemas[0]?.id || null);
    }
  }, []);

  // Save schemas to localStorage whenever they change
  useEffect(() => {
    if (schemas.length > 0) {
      saveToLocalStorage(STORAGE_KEY, schemas);
    }
  }, [schemas]);

  const handleSchemaChange = (schemaId: string) => {
    setCurrentSchemaId(schemaId);
  };

  const handleSchemaCreate = (name: string, schemaText: string) => {
    const { tables, relations } = parseSchema(schemaText);
    const newSchema: DatabaseSchema = {
      id: generateId(),
      name,
      schema: schemaText,
      tables,
      relations,
      createdAt: new Date().toISOString(),
    };
    setSchemas([...schemas, newSchema]);
    setCurrentSchemaId(newSchema.id);
  };

  const handleSchemaUpdate = (schemaId: string, schemaText: string) => {
    const { tables, relations } = parseSchema(schemaText);
    setSchemas(
      schemas.map((schema) =>
        schema.id === schemaId ? { ...schema, schema: schemaText, tables, relations } : schema,
      ),
    );
  };

  const handleSchemaDelete = (schemaId: string) => {
    const updatedSchemas = schemas.filter((schema) => schema.id !== schemaId);
    setSchemas(updatedSchemas);
    setCurrentSchemaId(updatedSchemas[0]?.id || null);
  };

  const currentSchema = schemas.find((s) => s.id === currentSchemaId);

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Sider width={400} style={{ background: '#fff', overflow: 'auto' }}>
        <Sidebar
          schemas={schemas}
          currentSchemaId={currentSchemaId}
          onSchemaChange={handleSchemaChange}
          onSchemaCreate={handleSchemaCreate}
          onSchemaUpdate={handleSchemaUpdate}
          onSchemaDelete={handleSchemaDelete}
        />
      </Sider>
      <Content>
        <Visualizer
          tables={currentSchema?.tables || []}
          relations={currentSchema?.relations || []}
        />
      </Content>
    </Layout>
  );
}

export default App;
