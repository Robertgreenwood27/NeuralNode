import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
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
    <>
      <NodeResizer 
        minWidth={200} 
        minHeight={100}
        isVisible={true}
        lineClassName="nodrag"
        handleClassName="nodrag"
      />
      <div className="editable-node">
        <Handle type="target" position={Position.Left} />
        <div className="node-content">
          <input
            value={title}
            onChange={handleTitleChange}
            className="node-title nodrag"
            placeholder="Node Title"
          />
          <button 
            className="toggle-chat-btn nodrag"
            onClick={toggleChat}
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          {showChat && <ChatInterface />}
        </div>
        <Handle type="source" position={Position.Right} />
      </div>
    </>
  );
}

export default memo(EditableNode);