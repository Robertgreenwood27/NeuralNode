import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useFlowChart } from '../../context/FlowChartContext';

const ChatInterface = ({ messages, nodeId }) => {
  const [input, setInput] = useState('');
  const scrollbarsRef = useRef(null);
  const { state, dispatch, generateAIResponse } = useFlowChart();

  const scrollToBottom = useCallback(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollToBottom();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      dispatch({ type: 'ADD_MESSAGE', payload: { nodeId, message: userMessage } });
      setInput('');
      
      // Prepare messages for AI, including full conversation history
      const conversationHistory = [
        ...messages,
        userMessage
      ].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Generate AI response
      await generateAIResponse(nodeId, conversationHistory);
    }
  }, [input, nodeId, messages, dispatch, generateAIResponse]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="chat-interface nodrag"
      onMouseDown={preventPropagation}
      onClick={preventPropagation}
    >
      <Scrollbars
        ref={scrollbarsRef}
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        renderTrackVertical={({ style, ...props }) =>
          <div {...props} className="track-vertical" style={{...style, right: 0, bottom: 2, top: 2, width: 8}} />
        }
        renderThumbVertical={({ style, ...props }) =>
          <div {...props} className="thumb-vertical" style={{...style, borderRadius: 4}} />
        }
        className="chat-messages"
      >
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {state.aiLoading[nodeId] && <div className="message ai">AI is thinking...</div>}
      </Scrollbars>
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
};

export default ChatInterface;