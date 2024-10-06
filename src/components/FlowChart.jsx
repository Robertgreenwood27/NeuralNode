import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import EditableNode from './EditableNode';
import AnimatedBackground from './AnimatedBackground';
import '@xyflow/react/dist/style.css';
import '../flow-chart-styles.css';

const nodeTypes = {
  editable: EditableNode,
};

export default function FlowChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: `${nodeId}`,
      type: 'editable',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `Node ${nodeId}` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((nid) => nid + 1);
  }, [nodeId, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: 'transparent' }}
      >
        <Controls />
      </ReactFlow>
      <button
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 4,
        }}
        onClick={addNode}
      >
        Add Node
      </button>
    </div>
  );
}