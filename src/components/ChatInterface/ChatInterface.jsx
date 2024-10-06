import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

const ChatInterface = ({ messages, onNewMessage }) => {
  const [input, setInput] = useState('');
  const scrollbarsRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollToBottom();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim()) {
      onNewMessage({ text: input, sender: 'user' });
      // Here you would typically call an API to get the AI's response
      // For now, we'll just echo the message
      setTimeout(() => {
        onNewMessage({ text: `Echo: ${input}`, sender: 'ai' });
      }, 500);
      setInput('');
    }
  }, [input, onNewMessage]);

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