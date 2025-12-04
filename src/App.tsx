import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { useEffect } from 'react';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useAppStore } from './store/useAppStore';
import { DEFAULT_SCHEMA_TEMPLATE } from './constants';
import './App.css';

function App() {
  const schemas = useAppStore((state) => state.schemas);
  const loadExampleSchemas = useAppStore((state) => state.loadExampleSchemas);
  const getCurrentSchema = useAppStore((state) => state.getCurrentSchema);
  const setSchemaText = useAppStore((state) => state.setSchemaText);

  // Load schemas on mount if empty
  useEffect(() => {
    if (schemas.length === 0) {
      loadExampleSchemas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadExample = () => {
    setSchemaText(DEFAULT_SCHEMA_TEMPLATE);
  };

  const currentSchema = getCurrentSchema();

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Header onLoadExample={handleLoadExample} />
      <Layout style={{ height: 'calc(100vh - 64px)' }}>
        <Sider width={400} style={{ background: '#fff', overflow: 'auto' }}>
          <Sidebar />
        </Sider>
        <Content>
          <Visualizer
            tables={currentSchema?.tables || []}
            relations={currentSchema?.relations || []}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
