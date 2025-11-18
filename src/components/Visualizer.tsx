import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, type FC } from 'react';
import type { Table, Relation } from '../types';
import TableNode from './TableNode';
import { useTheme } from '../contexts/ThemeContext';

interface VisualizerProps {
  tables: Table[];
  relations: Relation[];
}

type TableNode = Node & {
  data: Table;
};

const nodeTypes = {
  table: TableNode,
};
const Visualizer: FC<VisualizerProps> = ({ relations, tables }) => {
  const { theme } = useTheme();

  const initialNodes: TableNode[] = useMemo(
    () =>
      tables.map((table, i) => ({
        id: table.id,
        type: 'table',
        position: { x: (i % 3) * 350, y: Math.floor(i / 3) * 350 },
        data: table,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })),
    [tables],
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      relations.map((relation, index) => ({
        id: `edge-${relation.from}-${relation.to}-${index}`,
        source: relation.from,
        target: relation.to,
        sourceHandle: `${relation.from}-${relation.fromField}-source`,
        targetHandle: `${relation.to}-${relation.toField}-target`,
        label: relation.name,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: { stroke: '#1890ff', strokeWidth: 2 },
        labelStyle: { fontSize: 12, fill: '#666' },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
      })),
    [relations],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<TableNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (tables.length === 0) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme === 'dark' ? '#888' : '#999',
          fontSize: '18px',
          backgroundColor: theme === 'dark' ? '#141414' : '#f0f2f5',
        }}
      >
        No tables to display. Create or select a schema to get started.
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <ReactFlowProvider>
      <ReactFlow
        className="visualiser-diagram"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView={true}
        nodesDraggable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-right"
        style={{
          backgroundColor: isDark ? '#141414' : '#f0f2f5',
        }}
      >
        <Background gap={16} size={1} color={isDark ? '#333' : '#ddd'} />
        <Controls showInteractive={true} style={{ marginBottom: 40 }} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default Visualizer;
