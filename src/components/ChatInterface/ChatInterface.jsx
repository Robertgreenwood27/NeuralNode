import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFlowChart } from '../../context/useFlowChart';

const ChatInterface = React.memo(({ nodeId, fullScreen = false }) => {
  const [input, setInput] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const chatContainerRef = useRef(null);
  const editInputRef = useRef(null);
  const { state, dispatch, generateAIResponse } = useFlowChart();

  const messages = state.chatHistories[nodeId] || [];

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessage]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage = { id: Date.now(), text: input, sender: 'user' };
      dispatch({ type: 'ADD_MESSAGE', payload: { nodeId, message: userMessage } });
      setInput('');
      
      try {
        await generateAIResponse(nodeId, [userMessage]);
      } catch (error) {
        console.error('Error in AI response:', error);
      }
    }
  }, [input, nodeId, dispatch, generateAIResponse]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const startEditing = useCallback((message) => {
    setEditingMessage({ ...message });
  }, []);

  const handleEditChange = useCallback((e) => {
    setEditingMessage(prev => ({ ...prev, text: e.target.value }));
  }, []);

  const saveEdit = useCallback(() => {
    if (editingMessage) {
      dispatch({
        type: 'EDIT_MESSAGE',
        payload: { nodeId, messageId: editingMessage.id, newText: editingMessage.text }
      });
      setEditingMessage(null);
    }
  }, [dispatch, nodeId, editingMessage]);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  const handleMessageTouchStart = useCallback((message) => {
    const timer = setTimeout(() => {
      startEditing(message);
    }, 500); // 500ms long press to start editing
    setLongPressTimer(timer);
  }, [startEditing]);

  const handleMessageTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  }, [longPressTimer]);

  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const renderMessage = useCallback((msg) => {
    if (editingMessage && editingMessage.id === msg.id) {
      return (
        <div className="edit-message-container">
          <textarea
            ref={editInputRef}
            value={editingMessage.text}
            onChange={handleEditChange}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            autoFocus
          />
          <div className="edit-buttons">
            <button onClick={saveEdit}>Save</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      );
    }

    return (
      <div
        onDoubleClick={() => startEditing(msg)}
        onTouchStart={() => handleMessageTouchStart(msg)}
        onTouchEnd={handleMessageTouchEnd}
        className="message-content"
      >
        <strong>{msg.sender}:</strong>
        <div 
          dangerouslySetInnerHTML={{ __html: typeof msg.text === 'string' ? msg.text.replace(/\n/g, '<br>') : msg.text }}
        />
      </div>
    );
  }, [editingMessage, handleEditChange, handleKeyDown, saveEdit, cancelEdit, startEditing, handleMessageTouchStart, handleMessageTouchEnd]);

  return (
    <div className={`chat-interface nodrag ${fullScreen ? 'full-screen' : ''}`}>
      <div
        ref={chatContainerRef}
        className="chat-messages"
        style={{
          overflowY: 'auto',
          maxHeight: fullScreen ? 'calc(100vh - 200px)' : '400px',
          padding: '10px',
          marginBottom: '10px'
        }}
      >
        {messages.length === 0 ? (
          <div className="message system">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {renderMessage(msg)}
            </div>
          ))
        )}
        {state.aiLoading[nodeId] && <div className="message ai">AI is thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          rows={fullScreen ? "5" : "3"}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
});

export default ChatInterface;