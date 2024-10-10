function removeCircularReferences(obj) {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    }));
  }
  
  const initialState = {
    user: null,
    nodes: [],
    edges: [],
    chatHistories: {},
    deletedNodes: [],
    isLoading: true,
    dataLoaded: false,
    aiLoading: {},
    fullScreenNodeId: null,
  };
  
  function flowChartReducer(state, action) {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, user: action.payload };
      case 'SET_NODES':
        return { ...state, nodes: action.payload };
      case 'SET_EDGES':
        return { ...state, edges: action.payload };
      case 'SET_CHAT_HISTORIES':
        return { ...state, chatHistories: action.payload };
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_DATA_LOADED':
        return { ...state, dataLoaded: action.payload };
      case 'ADD_MESSAGE':
        return {
          ...state,
          chatHistories: {
            ...state.chatHistories,
            [action.payload.nodeId]: [
              ...(state.chatHistories[action.payload.nodeId] || []),
              {
                ...action.payload.message,
                text: action.payload.message.text.toString(), // Ensure text is always a string
                id: action.payload.message.id || Date.now() // Ensure each message has an id
              }
            ],
          },
        };
      case 'UPDATE_NODE_TITLE':
        return {
          ...state,
          nodes: state.nodes.map(node =>
            node.id === action.payload.id
              ? { ...node, data: { ...node.data, label: action.payload.title } }
              : node
          ),
        };
      case 'DELETE_NODE':
        const deletedNode = state.nodes.find(node => node.id === action.payload.id);
        const deletedEdges = state.edges.filter(edge => edge.source === action.payload.id || edge.target === action.payload.id);
        return {
          ...state,
          nodes: state.nodes.filter(node => node.id !== action.payload.id),
          edges: state.edges.filter(edge => edge.source !== action.payload.id && edge.target !== action.payload.id),
          chatHistories: Object.fromEntries(
            Object.entries(state.chatHistories).filter(([key]) => key !== action.payload.id)
          ),
          deletedNodes: [
            ...state.deletedNodes,
            { node: deletedNode, edges: deletedEdges, chatHistory: state.chatHistories[action.payload.id] }
          ],
        };
      case 'UNDO_DELETE':
        if (state.deletedNodes.length === 0) return state;
        const lastDeleted = state.deletedNodes[state.deletedNodes.length - 1];
        return {
          ...state,
          nodes: [...state.nodes, lastDeleted.node],
          edges: [...state.edges, ...lastDeleted.edges],
          chatHistories: {
            ...state.chatHistories,
            [lastDeleted.node.id]: lastDeleted.chatHistory
          },
          deletedNodes: state.deletedNodes.slice(0, -1),
        };
      case 'SET_DELETED_NODES':
        return {
          ...state,
          deletedNodes: action.payload,
        };
      case 'SET_AI_LOADING':
        return {
          ...state,
          aiLoading: action.payload.nodeId ?
            { ...state.aiLoading, [action.payload.nodeId]: action.payload.loading } :
            action.payload
        };
      case 'ADD_AI_MESSAGE':
        const { nodeId: aiNodeId, message: aiMessage } = action.payload;
        return {
          ...state,
          chatHistories: {
            ...state.chatHistories,
            [aiNodeId]: [...(state.chatHistories[aiNodeId] || []), { ...aiMessage, isAI: true }],
          },
        };
      case 'EDIT_MESSAGE':
        return {
          ...state,
          chatHistories: {
            ...state.chatHistories,
            [action.payload.nodeId]: state.chatHistories[action.payload.nodeId].map(msg =>
              msg.id === action.payload.messageId
                ? { ...msg, text: action.payload.newText }
                : msg
            ),
          },
        };
      case 'SET_FULLSCREEN_NODE':
        return { ...state, fullScreenNodeId: action.payload };
      default:
        return state;
    }
  }
  
  export { initialState, flowChartReducer, removeCircularReferences };