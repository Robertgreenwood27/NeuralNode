import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import ChatInterface from '../ChatInterface/ChatInterface';
import { useFlowChart } from '../../context/FlowChartContext';

function EditableNode({ data, id, selected }) {
  const { state, dispatch } = useFlowChart();
  const [title, setTitle] = useState(data.label);
  const [showChat, setShowChat] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 280, height: 150 });

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const onResize = useCallback((_, newDimensions) => {
    setDimensions(newDimensions);
    if (data.onDimensionsChange) {
      data.onDimensionsChange(newDimensions);
    }
  }, [data]);

  const handleNewMessage = useCallback((newMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { nodeId: id, message: newMessage } });
  }, [dispatch, id]);

  useEffect(() => {
    if (data.onDimensionsChange) {
      data.onDimensionsChange(dimensions);
    }
  }, [data, dimensions]);

  const isTooSmallForChat = dimensions.width < 200 || dimensions.height < 150;

  const leftHandleStyle = useMemo(() => ({ left: -8, top: dimensions.height / 2 }), [dimensions.height]);
  const rightHandleStyle = useMemo(() => ({ right: -8, top: dimensions.height / 2 }), [dimensions.height]);

  const chatInterface = useMemo(() => (
    <ChatInterface
      messages={state.chatHistories[id] || []}
      onNewMessage={handleNewMessage}
    />
  ), [state.chatHistories, id, handleNewMessage]);

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
              {showChat && chatInterface}
            </>
          )}
        </div>
        <Handle type="source" position={Position.Right} style={rightHandleStyle} />
      </div>
    </>
  );
}

function areEqual(prevProps, nextProps) {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.onDimensionsChange === nextProps.data.onDimensionsChange
  );
}

export default React.memo(EditableNode, areEqual);