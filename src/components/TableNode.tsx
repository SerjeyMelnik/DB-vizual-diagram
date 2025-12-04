import { Card, Flex, Tag, Typography } from 'antd';
import { Handle, Position } from '@xyflow/react';
import type { FC } from 'react';
import type { Table } from '../types';
import { useAppStore } from '../store/useAppStore';

interface TableNodeProps {
  data: Table;
}

const TableNode: FC<TableNodeProps> = ({ data }) => {
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div style={{ position: 'relative' }}>
      <Card
        size="small"
        title={<Typography.Text strong>{data.name}</Typography.Text>}
        style={{
          background: isDark ? '#1f1f1f' : 'white',
          width: '300px',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
        styles={{
          body: { padding: '8px 12px' },
          header: {
            borderBottom: `2px solid ${isDark ? '#177ddc' : '#1890ff'}`,
            background: isDark ? '#141414' : '#fafafa',
          },
        }}
      >
        <Flex vertical>
          {data.fields.map((field, index) => (
            <div
              key={field.name}
              style={{
                position: 'relative',
                padding: '8px 0',
                borderBottom:
                  index < data.fields.length - 1
                    ? `1px solid ${isDark ? '#303030' : '#f0f0f0'}`
                    : 'none',
              }}
            >
              {/* Left side handles */}
              {field.isForeign && (
                <>
                  <Handle
                    type="source"
                    position={Position.Left}
                    id={`${data.id}-${field.name}-source-left`}
                    style={{
                      left: -8,
                      width: 10,
                      height: 10,
                      background: '#ff7a45',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`${data.id}-${field.name}-target-left`}
                    style={{
                      left: -8,
                      width: 10,
                      height: 10,
                      background: '#ff7a45',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                </>
              )}

              {field.isPrimary && (
                <>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`${data.id}-${field.name}-target-left`}
                    style={{
                      left: -8,
                      width: 10,
                      height: 10,
                      background: '#1890ff',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Left}
                    id={`${data.id}-${field.name}-source-left`}
                    style={{
                      left: -8,
                      width: 10,
                      height: 10,
                      background: '#1890ff',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                </>
              )}

              {/* Right side handles */}
              {field.isForeign && (
                <>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${data.id}-${field.name}-source-right`}
                    style={{
                      right: -8,
                      width: 10,
                      height: 10,
                      background: '#ff7a45',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                  <Handle
                    type="target"
                    position={Position.Right}
                    id={`${data.id}-${field.name}-target-right`}
                    style={{
                      right: -8,
                      width: 10,
                      height: 10,
                      background: '#ff7a45',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                </>
              )}

              {field.isPrimary && (
                <>
                  <Handle
                    type="target"
                    position={Position.Right}
                    id={`${data.id}-${field.name}-target-right`}
                    style={{
                      right: -8,
                      width: 10,
                      height: 10,
                      background: '#1890ff',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${data.id}-${field.name}-source-right`}
                    style={{
                      right: -8,
                      width: 10,
                      height: 10,
                      background: '#1890ff',
                      border: `2px solid ${isDark ? '#1f1f1f' : '#fff'}`,
                    }}
                  />
                </>
              )}

              <Flex justify="space-between" align="center" gap={8}>
                <Flex align="center" gap={8} style={{ flex: 1 }}>
                  <Typography.Text strong={field.isPrimary || field.isForeign}>
                    {field.name}
                  </Typography.Text>
                  {field.isPrimary && <Tag color="blue">PK</Tag>}
                  {field.isForeign && <Tag color="orange">FK</Tag>}
                </Flex>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  {field.type}
                </Typography.Text>
              </Flex>
            </div>
          ))}
        </Flex>
      </Card>
    </div>
  );
};

export default TableNode;
