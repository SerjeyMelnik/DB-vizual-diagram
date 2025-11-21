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
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useCallback, type FC } from 'react';
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

// Helper function to determine the best handle position based on node positions
const getOptimalHandles = (
  sourceNode: TableNode | undefined,
  targetNode: TableNode | undefined,
  fromField: string,
  toField: string,
): { sourceHandle: string; targetHandle: string } => {
  if (!sourceNode || !targetNode) {
    // Fallback to default right-to-left
    return {
      sourceHandle: `${sourceNode?.id}-${fromField}-source-right`,
      targetHandle: `${targetNode?.id}-${toField}-target-left`,
    };
  }

  const sourceX = sourceNode.position.x;
  const targetX = targetNode.position.x;

  // Determine if target is to the right or left of source
  const isTargetOnRight = targetX > sourceX;

  if (isTargetOnRight) {
    // Target is on the right: connect from source's right to target's left
    return {
      sourceHandle: `${sourceNode.id}-${fromField}-source-right`,
      targetHandle: `${targetNode.id}-${toField}-target-left`,
    };
  } else {
    // Target is on the left: connect from source's left to target's right
    return {
      sourceHandle: `${sourceNode.id}-${fromField}-source-left`,
      targetHandle: `${targetNode.id}-${toField}-target-right`,
    };
  }
};
const getNodesMap = (nodes: TableNode[]) => new Map(nodes.map((node) => [node.id, node]));

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

  const [nodes, setNodes, onNodesChange] = useNodesState<TableNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodesMap = useMemo(() => getNodesMap(nodes), [nodes]);

  // Function to update edges based on current node positions
  const updateEdgesBasedOnNodePositions = useCallback(
    (currentNodes: Map<string, TableNode>) => {
      const updatedEdges = relations.map((relation, index) => {
        const sourceNode = currentNodes.get(relation.from);
        const targetNode = currentNodes.get(relation.to);

        const { sourceHandle, targetHandle } = getOptimalHandles(
          sourceNode,
          targetNode,
          relation.fromField,
          relation.toField,
        );

        return {
          id: `edge-${relation.from}-${relation.to}-${index}`,
          source: relation.from,
          target: relation.to,
          sourceHandle,
          targetHandle,
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
        } as Edge;
      });

      setEdges(updatedEdges);
    },
    [relations, setEdges],
  );

  // Custom node change handler that updates edges when nodes are dragged
  const handleNodesChange = useCallback(
    (changes: NodeChange<TableNode>[]) => {
      onNodesChange(changes);

      // Check if any node position is changing (during drag)
      const hasPositionChange = changes.some(
        (change) => change.type === 'position' && !change.dragging,
      );
      // console.log(changes);

      if (hasPositionChange) {
        console.log('asdsa');
        updateEdgesBasedOnNodePositions(nodesMap);
      }
    },
    [nodesMap, onNodesChange, updateEdgesBasedOnNodePositions],
  );

  useEffect(() => {
    setNodes(initialNodes);
    updateEdgesBasedOnNodePositions(getNodesMap(initialNodes));
  }, [initialNodes, setNodes, updateEdgesBasedOnNodePositions]);

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
        onNodesChange={handleNodesChange}
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
