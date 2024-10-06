import React, { useState, useCallback, memo, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import ChatInterface from './ChatInterface';

function EditableNode({ data }) {
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

  const onResize = useCallback((event, { width, height }) => {
    setDimensions({ width, height });
  }, []);

  const isTooSmallForChat = dimensions.width < 200 || dimensions.height < 150;

  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  // Persist messages in localStorage when they change
  useEffect(() => {
    localStorage.setItem(`nodeMessages-${data.id}`, JSON.stringify(messages));
  }, [messages, data.id]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(`nodeMessages-${data.id}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [data.id]);

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={50}
        isVisible={true}
        lineClassName="nodrag"
        handleClassName="nodrag"
        onResize={onResize}
      />
      <div className="editable-node" style={{ width: dimensions.width, height: dimensions.height }}>
        <Handle type="target" position={Position.Left} />
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
        <Handle type="source" position={Position.Right} />
      </div>
    </>
  );
}

export default memo(EditableNode);