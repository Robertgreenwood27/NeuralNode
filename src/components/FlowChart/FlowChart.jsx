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
import FullScreenNode from './FullScreenNode';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import '@xyflow/react/dist/style.css';
import './FlowChart.css';
import SignOutButton from '../Auth/SignOutButton';
import { useFlowChart } from '../../context/FlowChartContext';
import { ArrowUpCircle, Save, PlusCircle } from 'lucide-react';

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
  const { state, dispatch, saveUserData, setFullScreenNode } = useFlowChart();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);
  const [showFAB, setShowFAB] = useState(false);

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
  }, [state.isLoading, state.dataLoaded, state.nodes, state.edges]);

  useEffect(() => {
    const debouncedDispatch = setTimeout(() => {
      dispatch({ type: 'SET_NODES', payload: nodes });
    }, 300);
    return () => clearTimeout(debouncedDispatch);
  }, [nodes, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_EDGES', payload: edges });
  }, [edges, dispatch]);

  useEffect(() => {
    const handleFullScreenNode = (id) => {
      setFullScreenNode(id);
    };

    dispatch({ type: 'SET_FULLSCREEN_HANDLER', payload: handleFullScreenNode });

    return () => {
      dispatch({ type: 'SET_FULLSCREEN_HANDLER', payload: null });
    };
  }, [dispatch, setFullScreenNode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowFAB(scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onDimensionsChange = useCallback((id, dimensions) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, style: { ...node.style, ...dimensions } } : node
      )
    );
  }, []);

  const addNode = useCallback(() => {
    const newNode = {
      id: `${nodeId}`,
      type: 'editable',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        label: `Node ${nodeId}`,
        onDimensionsChange: (dimensions) => onDimensionsChange(`${nodeId}`, dimensions),
      },
      style: { width: 180, height: 100 }, // Updated dimensions
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((nid) => nid + 1);
  }, [nodeId, onDimensionsChange, setNodes]);

  const handleSave = useCallback(() => {
    saveUserData();
  }, [saveUserData]);

  const handleUndoDelete = useCallback(() => {
    dispatch({ type: 'UNDO_DELETE' });
  }, [dispatch]);

  const closeFullScreen = useCallback(() => {
    setFullScreenNode(null);
  }, [setFullScreenNode]);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <div className="flowchart-container">
      <AnimatedBackground />
      <CustomEdgeGradient />
      {state.fullScreenNodeId ? (
        <FullScreenNode nodeId={state.fullScreenNodeId} onClose={closeFullScreen} />
      ) : (
        <>
          {memoizedFlow}
          <button className="action-button add-node" onClick={addNode}>
            <PlusCircle size={16} />
            Add Node
          </button>
          <button className="action-button save" onClick={handleSave}>
            <Save size={16} />
            Save
          </button>
          <button 
            className="action-button undo-delete" 
            onClick={handleUndoDelete}
            disabled={state.deletedNodes.length === 0}
          >
            Undo Delete
          </button>
          {showFAB && (
            <div className="fab-container">
              <button className="fab" onClick={handleSave} aria-label="Save">
                <Save size={24} />
              </button>
              <button className="fab" onClick={handleScrollToTop} aria-label="Scroll to top">
                <ArrowUpCircle size={24} />
              </button>
            </div>
          )}
          <SignOutButton />
        </>
      )}
    </div>
  );
}

export default React.memo(FlowChart);