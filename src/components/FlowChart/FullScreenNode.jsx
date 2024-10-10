import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFlowChart } from '../../context/useFlowChart';
import ChatInterface from '../ChatInterface/ChatInterface';
import { X, ChevronLeft } from 'lucide-react';

const FullScreenNode = ({ nodeId, onClose }) => {
  const { state, dispatch } = useFlowChart();
  const node = state.nodes.find(n => n.id === nodeId);
  const [title, setTitle] = useState(node.data.label);
  const [isEditing, setIsEditing] = useState(false);
  const titleInputRef = useRef(null);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const saveTitleChange = useCallback(() => {
    dispatch({ type: 'UPDATE_NODE_TITLE', payload: { id: nodeId, title } });
    setIsEditing(false);
  }, [dispatch, nodeId, title]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveTitleChange();
    }
  }, [saveTitleChange]);

  return (
    <div className="full-screen-node">
      <div className="full-screen-header">
        <button className="back-button" onClick={onClose} aria-label="Back">
          <ChevronLeft size={24} />
        </button>
        {isEditing ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onBlur={saveTitleChange}
            onKeyDown={handleKeyDown}
            className="full-screen-title-input"
            placeholder="Node Title"
          />
        ) : (
          <h2 className="full-screen-title" onClick={startEditing}>{title}</h2>
        )}
        <button className="close-full-screen" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
      </div>
      <div className="full-screen-content">
        <ChatInterface nodeId={nodeId} fullScreen={true} />
      </div>
    </div>
  );
};

export default FullScreenNode;