import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import { useAppStore } from '../store/useAppStore';
import { calculateTableLayout } from '../utils/layoutUtils';

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

const VisualizerContent: FC<VisualizerProps> = ({ relations, tables }) => {
  const theme = useAppStore((state) => state.theme);
  const { fitView } = useReactFlow();

  const initialNodes: TableNode[] = useMemo(() => {
    const positions = calculateTableLayout(tables, {
      horizontalSpacing: 400,
      verticalSpacing: 450,
      tablesPerRow: 3,
    });

    return tables.map((table, i) => {
      const { x, y } = positions[i];
      return {
        id: table.id,
        type: 'table',
        position: { x, y },
        data: table,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [tables]);

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
          animated: relations.length < 30, // Disabled for performance
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

      // Only update edges after drag ends to reduce recalculations
      const hasDragEnd = changes.some(
        (change) => change.type === 'position' && change.dragging === false,
      );

      if (hasDragEnd) {
        updateEdgesBasedOnNodePositions(nodesMap);
      }
    },
    [nodesMap, onNodesChange, updateEdgesBasedOnNodePositions],
  );

  useEffect(() => {
    setNodes(initialNodes);
    updateEdgesBasedOnNodePositions(getNodesMap(initialNodes));
    // Center view on nodes after they are set
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 0);
  }, [initialNodes, setNodes, updateEdgesBasedOnNodePositions, fitView]);

  if (tables.length === 0) {
    return (
      <div
        style={{
          height: '100%',
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
      // proOptions={{ hideAttribution: true }}
      // elevateNodesOnSelect={false}
      // elevateEdgesOnSelect={false}
      style={{
        backgroundColor: isDark ? '#141414' : '#f0f2f5',
      }}
    >
      <Background gap={16} size={1} color={isDark ? '#333' : '#ddd'} />
      <Controls
        showInteractive={true}
        style={{ gap: 5 }}
        fitViewOptions={{ duration: 300, padding: 0.2 }}
        className={isDark ? 'dark' : ''}
      />
    </ReactFlow>
  );
};

const Visualizer: FC<VisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <VisualizerContent {...props} />
    </ReactFlowProvider>
  );
};

export default Visualizer;
