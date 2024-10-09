import React, { useState, useCallback, useMemo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import ChatInterface from '../ChatInterface/ChatInterface';
import { useFlowChart } from '../../context/FlowChartContext';

const EditableNode = React.memo(({ data, id, selected }) => {
  const { dispatch, setFullScreenNode } = useFlowChart();
  const [title, setTitle] = useState(data.label);
  const [showChat, setShowChat] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 280, height: 150 });

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    dispatch({ type: 'UPDATE_NODE_TITLE', payload: { id, title: newTitle } });
  }, [dispatch, id]);

  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const onResize = useCallback((_, newDimensions) => {
    setDimensions(newDimensions);
  }, []);

  const handleDeleteNode = useCallback(() => {
    dispatch({ type: 'DELETE_NODE', payload: { id } });
  }, [dispatch, id]);

  const handleFullScreen = useCallback(() => {
    setFullScreenNode(id);
  }, [setFullScreenNode, id]);

  const isTooSmallForChat = dimensions.width < 200 || dimensions.height < 150;

  const leftHandleStyle = useMemo(() => ({ left: -8, top: dimensions.height / 2 }), [dimensions.height]);
  const rightHandleStyle = useMemo(() => ({ right: -8, top: dimensions.height / 2 }), [dimensions.height]);

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
              <button
                className="full-screen-btn nodrag"
                onClick={handleFullScreen}
              >
                Full Screen
              </button>
              {showChat && <ChatInterface nodeId={id} />}
            </>
          )}
          <button
            className="delete-node-btn nodrag"
            onClick={handleDeleteNode}
          >
            Delete Node
          </button>
        </div>
        <Handle type="source" position={Position.Right} style={rightHandleStyle} />
      </div>
    </>
  );
});

export default EditableNode;