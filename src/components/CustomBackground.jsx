import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import EditableNode from './EditableNode';
import '@xyflow/react/dist/style.css';
import '../flow-chart-styles.css';

const nodeTypes = {
  editable: EditableNode,
};

export default function FlowChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: `${nodeId}`,
      type: 'editable',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `Node ${nodeId}` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((nid) => nid + 1);
  }, [nodeId, setNodes]);

  useEffect(() => {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = [];
    for (let i = 0; i < 80; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
      });
    }

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(0, 150, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(update);
    };

    update();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <canvas
        id="backgroundCanvas"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Controls />
      </ReactFlow>
      <button
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 3,
        }}
        onClick={addNode}
      >
        Add Node
      </button>
    </div>
  );
}
