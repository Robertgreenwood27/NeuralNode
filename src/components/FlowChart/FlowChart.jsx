import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import { useFlowChart } from '../../context/FlowChartContext';

const nodeTypes = {
  editable: EditableNode,
};

const CustomEdgeGradient = React.memo(() => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff3333" />
        <stop offset="100%" stopColor="#ff8080" />
      </linearGradient>
    </defs>
  </svg>
));

const customEdgeStyle = {
  stroke: 'url(#edge-gradient)',
  strokeWidth: 3,
  filter: 'drop-shadow(0 0 5px #ff3333)',
};

const FlowChart = () => {
  const { state, dispatch, saveUserData } = useFlowChart();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  const onDimensionsChange = useCallback((id, dimensions) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, style: { ...node.style, ...dimensions } } : node
      )
    );
  }, []);

  useEffect(() => {
    if (!state.isLoading && state.dataLoaded) {
      const nodesWithFunction = state.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onDimensionsChange: (dimensions) => onDimensionsChange(node.id, dimensions)
        }
      }));
      setNodes(nodesWithFunction);
      setEdges(state.edges);
      const maxId = Math.max(...state.nodes.map(node => parseInt(node.id)), 0);
      setNodeId(maxId + 1);
    }
  }, [state.isLoading, state.dataLoaded, state.nodes, state.edges, onDimensionsChange]);

  useEffect(() => {
    const debouncedDispatch = setTimeout(() => {
      dispatch({ type: 'SET_NODES', payload: nodes });
    }, 300);
    return () => clearTimeout(debouncedDispatch);
  }, [nodes, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_EDGES', payload: edges });
  }, [edges, dispatch]);

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
    []
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: `${nodeId}`,
      type: 'editable',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        label: `Node ${nodeId}`,
        onDimensionsChange: (dimensions) => onDimensionsChange(`${nodeId}`, dimensions),
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((nid) => nid + 1);
  }, [nodeId, onDimensionsChange]);

  const handleSave = useCallback(() => {
    saveUserData();
  }, [saveUserData]);

  const memoizedFlow = useMemo(() => (
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
  ), [nodes, edges, onNodesChange, onEdgesChange, onConnect]);

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <CustomEdgeGradient />
      {memoizedFlow}
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
      <button
        style={{
          position: 'absolute',
          right: 10,
          top: 50,
          zIndex: 4,
          backgroundColor: 'rgba(0, 255, 0, 0.7)',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
        onClick={handleSave}
      >
        Save
      </button>
      <SignOutButton />
    </div>
  );
}

export default React.memo(FlowChart);