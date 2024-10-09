import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFlowChart } from '../../context/FlowChartContext';

const ChatInterface = React.memo(({ nodeId }) => {
  const [input, setInput] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
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

  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="chat-interface nodrag"
      onMouseDown={preventPropagation}
      onClick={preventPropagation}
    >
      <div
        ref={chatContainerRef}
        className="chat-messages"
        style={{
          overflowY: 'auto',
          maxHeight: '200px',
          padding: '10px',
          marginBottom: '10px'
        }}
      >
        {messages.length === 0 ? (
          <div className="message system">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {editingMessage && editingMessage.id === msg.id ? (
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
              ) : (
                <div
                  onDoubleClick={() => startEditing(msg)}
                  style={{ userSelect: 'text', cursor: 'text' }}
                >
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              )}
            </div>
          ))
        )}
        {state.aiLoading[nodeId] && <div className="message ai">AI is thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
});

export default ChatInterface;