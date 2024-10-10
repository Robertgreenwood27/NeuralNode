export const setUser = (user) => ({
    type: 'SET_USER',
    payload: user,
  });
  
  export const setNodes = (nodes) => ({
    type: 'SET_NODES',
    payload: nodes,
  });
  
  export const setEdges = (edges) => ({
    type: 'SET_EDGES',
    payload: edges,
  });
  
  export const setChatHistories = (chatHistories) => ({
    type: 'SET_CHAT_HISTORIES',
    payload: chatHistories,
  });
  
  export const setLoading = (isLoading) => ({
    type: 'SET_LOADING',
    payload: isLoading,
  });
  
  export const setDataLoaded = (dataLoaded) => ({
    type: 'SET_DATA_LOADED',
    payload: dataLoaded,
  });
  
  export const addMessage = (nodeId, message) => ({
    type: 'ADD_MESSAGE',
    payload: { nodeId, message },
  });
  
  export const updateNodeTitle = (id, title) => ({
    type: 'UPDATE_NODE_TITLE',
    payload: { id, title },
  });
  
  export const deleteNode = (id) => ({
    type: 'DELETE_NODE',
    payload: { id },
  });
  
  export const undoDelete = () => ({
    type: 'UNDO_DELETE',
  });
  
  export const setDeletedNodes = (deletedNodes) => ({
    type: 'SET_DELETED_NODES',
    payload: deletedNodes,
  });
  
  export const setAILoading = (nodeId, loading) => ({
    type: 'SET_AI_LOADING',
    payload: { nodeId, loading },
  });
  
  export const addAIMessage = (nodeId, message) => ({
    type: 'ADD_AI_MESSAGE',
    payload: { nodeId, message },
  });
  
  export const editMessage = (nodeId, messageId, newText) => ({
    type: 'EDIT_MESSAGE',
    payload: { nodeId, messageId, newText },
  });
  
  export const setFullScreenNode = (nodeId) => ({
    type: 'SET_FULLSCREEN_NODE',
    payload: nodeId,
  });