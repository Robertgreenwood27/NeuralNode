import React, { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useFlowChart } from '../../context/useFlowChart';
import { Maximize2, Trash2 } from 'lucide-react';

const EditableNode = ({ data, id }) => {
  const { dispatch, setFullScreenNode } = useFlowChart();
  const [title, setTitle] = useState(data.label);

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    dispatch({ type: 'UPDATE_NODE_TITLE', payload: { id, title: newTitle } });
  }, [dispatch, id]);

  const handleDeleteNode = useCallback(() => {
    dispatch({ type: 'DELETE_NODE', payload: { id } });
  }, [dispatch, id]);

  const handleFullScreen = useCallback(() => {
    setFullScreenNode(id);
  }, [setFullScreenNode, id]);

  return (
    <div className="editable-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <input
          value={title}
          onChange={handleTitleChange}
          className="node-title nodrag"
          placeholder="Node Title"
        />
        <div className="node-buttons">
          <button
            className="node-button nodrag"
            onClick={handleFullScreen}
            title="Full Screen"
          >
            <Maximize2 size={18} />
            <span className="visually-hidden">Full Screen</span>
          </button>
          <button
            className="node-button nodrag"
            onClick={handleDeleteNode}
            title="Delete Node"
          >
            <Trash2 size={18} />
            <span className="visually-hidden">Delete Node</span>
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default React.memo(EditableNode);