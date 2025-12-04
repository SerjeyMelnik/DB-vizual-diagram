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
import { DEFAULT_SCHEMA_TEMPLATE } from '../constants';
import { useAppStore } from '../store/useAppStore';

const { Text } = Typography;

interface HeaderProps {
  onLoadExample: () => void;
}

const Header: FC<HeaderProps> = ({ onLoadExample }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');

  // Get state from Zustand store
  const schemas = useAppStore((state) => state.schemas);
  const currentSchemaId = useAppStore((state) => state.currentSchemaId);
  const schemaText = useAppStore((state) => state.schemaText);
  const theme = useAppStore((state) => state.theme);
  const getCurrentSchema = useAppStore((state) => state.getCurrentSchema);

  // Get actions from Zustand store
  const changeSchema = useAppStore((state) => state.changeSchema);
  const createSchema = useAppStore((state) => state.createSchema);
  const updateSchema = useAppStore((state) => state.updateSchema);
  const deleteSchema = useAppStore((state) => state.deleteSchema);
  const setSchemaText = useAppStore((state) => state.setSchemaText);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const currentSchema = getCurrentSchema();

  const handleSchemaSelect = (schemaId: string) => {
    changeSchema(schemaId);
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

    updateSchema(currentSchemaId, schemaText);
    message.success('Schema updated successfully');
  };

  const handleCreateNew = () => {
    if (!newSchemaName.trim()) {
      message.error('Please enter a schema name');
      return;
    }

    const schemaContent = schemaText.trim() || DEFAULT_SCHEMA_TEMPLATE;
    createSchema(newSchemaName, schemaContent);
    setNewSchemaName('');
    setSchemaText(''); // Clear the schema text field after creating
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
        deleteSchema(currentSchemaId);
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
