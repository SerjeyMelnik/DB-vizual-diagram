import { Button, Flex, Select, Space, Switch, Typography, message, Modal, Input } from 'antd';
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

const { Text } = Typography;

interface HeaderProps {
  schemas: DatabaseSchema[];
  currentSchemaId: string | null;
  currentSchema: DatabaseSchema | undefined;
  schemaText: string;
  onSchemaChange: (schemaId: string) => void;
  onSchemaCreate: (name: string, schema: string) => void;
  onSchemaUpdate: (schemaId: string, schema: string) => void;
  onSchemaDelete: (schemaId: string) => void;
  onSchemaTextChange: (text: string) => void;
  onLoadExample: () => void;
}

const Header: FC<HeaderProps> = ({
  schemas,
  currentSchemaId,
  currentSchema,
  schemaText,
  onSchemaChange,
  onSchemaCreate,
  onSchemaUpdate,
  onSchemaDelete,
  onSchemaTextChange,
  onLoadExample,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSchemaSelect = (schemaId: string) => {
    onSchemaChange(schemaId);
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
    onSchemaTextChange(''); // Clear the schema text field after creating
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
      cancelText: 'Cancel',
      onOk: () => {
        onSchemaDelete(currentSchemaId);
        message.success('Schema deleted successfully');
      },
    });
  };

  const isDark = theme === 'dark';

  return (
    <>
      <div
        style={{
          height: '64px',
          padding: '0 24px',
          background: isDark ? '#141414' : '#fff',
          borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Flex align="center" gap={24} style={{ flex: 1 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            DB Visual Diagram
          </Typography.Title>

          <Flex align="center" gap={12}>
            <Text strong>Schema:</Text>
            <Select
              style={{ width: 200 }}
              placeholder="Choose a schema"
              value={currentSchemaId}
              onChange={handleSchemaSelect}
              options={schemas.map((schema) => ({
                label: schema.name,
                value: schema.id,
              }))}
            />
          </Flex>

          <Flex gap={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              New Schema
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!currentSchemaId}
            >
              Save & Visualize
            </Button>
            <Button icon={<FileTextOutlined />} onClick={onLoadExample}>
              Load Example
            </Button>
            {currentSchemaId && (
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Delete
              </Button>
            )}
          </Flex>
        </Flex>

        <Flex align="center" gap={12}>
          {currentSchema && (
            <Space size="large">
              <Text type="secondary">
                <strong>Tables:</strong> {currentSchema.tables.length}
              </Text>
              <Text type="secondary">
                <strong>Relations:</strong> {currentSchema.relations.length}
              </Text>
            </Space>
          )}

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
      </div>

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
    </>
  );
};

export default Header;
