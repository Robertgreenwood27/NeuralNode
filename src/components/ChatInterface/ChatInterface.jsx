import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useFlowChart } from '../../context/FlowChartContext';

const ChatInterface = ({ nodeId }) => {
  const [input, setInput] = useState('');
  const scrollbarsRef = useRef(null);
  const { state, dispatch, generateAIResponse, getCombinedChatHistory } = useFlowChart();

  const messages = useMemo(() => getCombinedChatHistory(nodeId), [getCombinedChatHistory, nodeId]);

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
      
      console.log('Sending message to AI:', userMessage);
      try {
        const aiMessage = await generateAIResponse(nodeId, [userMessage]);
        console.log('Received AI response:', aiMessage);
      } catch (error) {
        console.error('Error in AI response:', error);
      }
    }
  }, [input, nodeId, dispatch, generateAIResponse]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  console.log('Rendering ChatInterface for node:', nodeId);
  console.log('Number of messages:', messages.length);

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
        {messages.length === 0 ? (
          <div className="message system">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))
        )}
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

export default React.memo(ChatInterface);