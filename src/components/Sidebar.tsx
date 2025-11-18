import {
  Button,
  Card,
  Divider,
  Flex,
  Input,
  Select,
  Space,
  Typography,
  message,
  Modal,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import type { FC } from 'react';
import { useState } from 'react';
import type { DatabaseSchema } from '../types';
import { DEFAULT_SCHEMA_TEMPLATE } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface SidebarProps {
  schemas: DatabaseSchema[];
  currentSchemaId: string | null;
  onSchemaChange: (schemaId: string) => void;
  onSchemaCreate: (name: string, schema: string) => void;
  onSchemaUpdate: (schemaId: string, schema: string) => void;
  onSchemaDelete: (schemaId: string) => void;
}

const Sidebar: FC<SidebarProps> = ({
  schemas,
  currentSchemaId,
  onSchemaChange,
  onSchemaCreate,
  onSchemaUpdate,
  onSchemaDelete,
}) => {
  const [schemaText, setSchemaText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const { theme, toggleTheme } = useTheme();

  const currentSchema = schemas.find((s) => s.id === currentSchemaId);

  const handleSchemaSelect = (schemaId: string) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (schema) {
      setSchemaText(schema.schema);
      onSchemaChange(schemaId);
    }
  };

  const handleSave = () => {
    if (!currentSchemaId) {
      message.warning('Please select or create a schema first');
      return;
    }

    if (!schemaText.trim()) {
      message.error('Schema cannot be empty');
      return;
    }

    onSchemaUpdate(currentSchemaId, schemaText);
    message.success('Schema updated successfully');
  };

  const handleCreateNew = () => {
    if (!newSchemaName.trim()) {
      message.error('Please enter a schema name');
      return;
    }

    const schemaContent = schemaText.trim() || DEFAULT_SCHEMA_TEMPLATE;
    onSchemaCreate(newSchemaName, schemaContent);
    setNewSchemaName('');
    setIsModalVisible(false);
    message.success('Schema created successfully');
  };

  const handleDelete = () => {
    if (!currentSchemaId) {
      message.warning('No schema selected');
      return;
    }

    Modal.confirm({
      title: 'Delete Schema',
      content: 'Are you sure you want to delete this schema?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        onSchemaDelete(currentSchemaId);
        setSchemaText('');
        message.success('Schema deleted successfully');
      },
    });
  };

  const handleLoadExample = () => {
    setSchemaText(DEFAULT_SCHEMA_TEMPLATE);
  };

  return (
    <Card
      style={{
        height: '100vh',
        overflow: 'auto',
        borderRadius: 0,
      }}
    >
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Title level={4} style={{ margin: 0 }}>
            Database Schema Editor
          </Title>
          <Flex align="center" gap={8}>
            <BulbOutlined style={{ fontSize: '16px' }} />
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </Flex>
        </Flex>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Select Schema</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Choose a schema"
              value={currentSchemaId}
              onChange={handleSchemaSelect}
              options={schemas.map((schema) => ({
                label: schema.name,
                value: schema.id,
              }))}
            />
          </div>

          <Flex gap={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              block
            >
              New Schema
            </Button>
            {currentSchemaId && <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />}
          </Flex>

          <Divider style={{ margin: '8px 0' }} />

          <div>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Text strong>SQL Schema</Text>
              <Button size="small" icon={<FileTextOutlined />} onClick={handleLoadExample}>
                Example
              </Button>
            </Flex>
            <TextArea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              placeholder="Enter SQL CREATE TABLE statements..."
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
              rows={20}
            />
          </div>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            size="large"
            block
            disabled={!currentSchemaId}
          >
            Save & Visualize
          </Button>

          {currentSchema && (
            <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <strong>Name:</strong> {currentSchema.name}
                </Text>
                {currentSchema.description && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <strong>Description:</strong> {currentSchema.description}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <strong>Tables:</strong> {currentSchema.tables.length}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <strong>Relations:</strong> {currentSchema.relations.length}
                </Text>
              </Space>
            </Card>
          )}
        </Space>
      </Flex>

      <Modal
        title="Create New Schema"
        open={isModalVisible}
        onOk={handleCreateNew}
        onCancel={() => setIsModalVisible(false)}
        okText="Create"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Schema Name</Text>
          <Input
            placeholder="Enter schema name"
            value={newSchemaName}
            onChange={(e) => setNewSchemaName(e.target.value)}
            onPressEnter={handleCreateNew}
          />
        </Space>
      </Modal>
    </Card>
  );
};

export default Sidebar;
