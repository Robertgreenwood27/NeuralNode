import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import EditableNode from './EditableNode';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import '@xyflow/react/dist/style.css';
import './FlowChartStyles.css';
import SignOutButton from '../Auth/SignOutButton';

const nodeTypes = {
  editable: EditableNode,
};

const CustomEdgeGradient = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff3333" />
        <stop offset="100%" stopColor="#ff8080" />
      </linearGradient>
    </defs>
  </svg>
);

const customEdgeStyle = {
  stroke: 'url(#edge-gradient)',
  strokeWidth: 3,
  filter: 'drop-shadow(0 0 5px #ff3333)',
};

const FlowChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: customEdgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#ff8080',
      },
    }, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: `${nodeId}`,
      type: 'editable',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        label: `Node ${nodeId}`,
        onDimensionsChange: (id, dimensions) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { ...node, style: { ...node.style, ...dimensions } } : node
            )
          );
        },
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((nid) => nid + 1);
  }, [nodeId, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <CustomEdgeGradient />
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
          backgroundColor: 'rgba(0, 150, 255, 0.7)',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
        onClick={addNode}
      >
        Add Node
      </button>
      <SignOutButton />
    </div>
  );
}

export default FlowChart;