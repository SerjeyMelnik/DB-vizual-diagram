import { Card, Input } from 'antd';
import type { FC } from 'react';
import { useAppStore } from '../store/useAppStore';

const { TextArea } = Input;

const Sidebar: FC = () => {
  const schemaText = useAppStore((state) => state.schemaText);
  const setSchemaText = useAppStore((state) => state.setSchemaText);

  return (
    <Card
      style={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <TextArea
        value={schemaText}
        onChange={(e) => setSchemaText(e.target.value)}
        placeholder="Enter SQL CREATE TABLE statements..."
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          marginTop: 8,
          height: 'calc(100vh - 140px)',
        }}
      />
    </Card>
  );
};

export default Sidebar;
