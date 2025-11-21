import { Card, Flex, Input, Typography } from 'antd';
import type { FC } from 'react';

const { TextArea } = Input;
const { Text } = Typography;

interface SidebarProps {
  schemaText: string;
  onSchemaTextChange: (text: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ schemaText, onSchemaTextChange }) => {
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
        onChange={(e) => onSchemaTextChange(e.target.value)}
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
