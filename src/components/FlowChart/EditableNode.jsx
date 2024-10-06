import React, { useState, useCallback, memo, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import ChatInterface from '../ChatInterface/ChatInterface';

function EditableNode({ data, id, selected }) {
  const [title, setTitle] = useState(data.label);
  const [showChat, setShowChat] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 280, height: 150 });
  const [messages, setMessages] = useState([]);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const onResize = useCallback((_, newDimensions) => {
    setDimensions(newDimensions);
  }, []);

  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  useEffect(() => {
    localStorage.setItem(`nodeMessages-${id}`, JSON.stringify(messages));
  }, [messages, id]);

  useEffect(() => {
    const storedMessages = localStorage.getItem(`nodeMessages-${id}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [id]);

  // New effect to update node dimensions in the parent component
  useEffect(() => {
    data.onDimensionsChange(id, dimensions);
  }, [data, id, dimensions]);

  const isTooSmallForChat = dimensions.width < 200 || dimensions.height < 150;

  const leftHandleStyle = { left: -8, top: dimensions.height / 2 };
  const rightHandleStyle = { right: -8, top: dimensions.height / 2 };

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={50}
        isVisible={selected}
        lineClassName="nodrag"
        handleClassName="nodrag"
        onResize={onResize}
      />
      <div className="editable-node" style={{ width: dimensions.width, height: dimensions.height }}>
        <Handle type="target" position={Position.Left} style={leftHandleStyle} />
        <div className="node-content">
          <input
            value={title}
            onChange={handleTitleChange}
            className="node-title nodrag"
            placeholder="Node Title"
          />
          {!isTooSmallForChat && (
            <>
              <button 
                className="toggle-chat-btn nodrag"
                onClick={toggleChat}
              >
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
              {showChat && (
                <ChatInterface
                  messages={messages}
                  onNewMessage={handleNewMessage}
                />
              )}
            </>
          )}
        </div>
        <Handle type="source" position={Position.Right} style={rightHandleStyle} />
      </div>
    </>
  );
}

export default memo(EditableNode);