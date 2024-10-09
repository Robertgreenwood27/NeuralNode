import React, { useState, useCallback, useEffect } from 'react';
import { useFlowChart } from '../../context/FlowChartContext';
import ChatInterface from '../ChatInterface/ChatInterface';

const FullScreenNode = ({ nodeId, onClose }) => {
  const { state, dispatch } = useFlowChart();
  const node = state.nodes.find(n => n.id === nodeId);
  const [title, setTitle] = useState(node.data.label);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    dispatch({ type: 'UPDATE_NODE_TITLE', payload: { id: nodeId, title: newTitle } });
  }, [dispatch, nodeId]);

  useEffect(() => {
    const handleResize = () => {
      setIsKeyboardVisible(window.visualViewport.height < window.innerHeight);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`full-screen-node ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
      <div className="full-screen-header">
        <input
          value={title}
          onChange={handleTitleChange}
          className="full-screen-title"
          placeholder="Node Title"
        />
        <button className="close-full-screen" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="full-screen-content">
        <ChatInterface nodeId={nodeId} fullScreen={true} />
      </div>
    </div>
  );
};

export default FullScreenNode;