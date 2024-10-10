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
import BottomNav from './BottomNav';
import '@xyflow/react/dist/style.css';
import './FlowChart.css';
import SignOutButton from '../Auth/SignOutButton';
import { useFlowChart } from '../../context/FlowChartContext';
import { ArrowUpCircle, Save, PlusCircle, Undo } from 'lucide-react';

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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      setShowScrollToTop(window.pageYOffset > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      style: { width: 180, height: 100 },
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
        <FullScreenNode nodeId={state.fullScreenNodeId} onClose={() => setFullScreenNode(null)} />
      ) : (
        <>
          {memoizedFlow}
          <SignOutButton />
          {isMobile ? (
            <BottomNav
              onAddNode={addNode}
              onSave={handleSave}
              onUndoDelete={handleUndoDelete}
              onScrollToTop={handleScrollToTop}
              canUndo={state.deletedNodes.length > 0}
              showScrollToTop={showScrollToTop}
            />
          ) : (
            <div className="fab-container">
              <button className="fab" onClick={addNode} aria-label="Add Node">
                <PlusCircle size={24} />
              </button>
              <button className="fab" onClick={handleSave} aria-label="Save">
                <Save size={24} />
              </button>
              <button 
                className="fab" 
                onClick={handleUndoDelete}
                disabled={state.deletedNodes.length === 0}
                aria-label="Undo Delete"
              >
                <Undo size={24} />
              </button>
              {showScrollToTop && (
                <button className="fab" onClick={handleScrollToTop} aria-label="Scroll to top">
                  <ArrowUpCircle size={24} />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(FlowChart);