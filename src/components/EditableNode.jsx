import React, { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import ChatInterface from './ChatInterface';

function EditableNode({ data }) {
  const [title, setTitle] = useState(data.label);
  const [showChat, setShowChat] = useState(false);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  return (
    <div className="editable-node">
      <Handle type="target" position={Position.Left} style={{ left: -5 }} />
      <div className="node-content">
        <input
          value={title}
          onChange={handleTitleChange}
          className="node-title"
          placeholder="Node Title"
        />
        <button 
          className="toggle-chat-btn"
          onClick={toggleChat}
        >
          {showChat ? 'Hide Chat' : 'Show Chat'}
        </button>
        {showChat && <ChatInterface />}
      </div>
      <Handle type="source" position={Position.Right} style={{ right: -5 }} />
    </div>
  );
}

export default EditableNode;