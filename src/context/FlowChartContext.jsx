import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import openaiService from '../services/OpenAIService';

const FlowChartContext = createContext();

const initialState = {
  user: null,
  nodes: [],
  edges: [],
  chatHistories: {},
  deletedNodes: [],
  isLoading: true,
  dataLoaded: false,
  aiLoading: {},
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
      console.log('Adding message:', action.payload);
      return {
        ...state,
        chatHistories: {
          ...state.chatHistories,
          [action.payload.nodeId]: [
            ...(state.chatHistories[action.payload.nodeId] || []),
            action.payload.message
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
    default:
      return state;
  }
}

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

export function FlowChartProvider({ children }) {
  const [state, dispatch] = useReducer(flowChartReducer, initialState);

  const loadUserData = useCallback(async (userId) => {
    if (state.dataLoaded) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    const userDocRef = doc(db, 'users', userId);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        dispatch({ type: 'SET_NODES', payload: userData.nodes || [] });
        dispatch({ type: 'SET_EDGES', payload: userData.edges || [] });
        dispatch({ type: 'SET_CHAT_HISTORIES', payload: userData.chatHistories || {} });
      }
      dispatch({ type: 'SET_DATA_LOADED', payload: true });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.dataLoaded]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      if (user) {
        loadUserData(user.uid);
      } else {
        dispatch({ type: 'SET_NODES', payload: [] });
        dispatch({ type: 'SET_EDGES', payload: [] });
        dispatch({ type: 'SET_CHAT_HISTORIES', payload: {} });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_DATA_LOADED', payload: false });
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  const saveUserData = useCallback(async () => {
    if (state.user) {
      const userDocRef = doc(db, 'users', state.user.uid);
      const nodesToSave = state.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label
        }
      }));
      const dataToSave = removeCircularReferences({
        nodes: nodesToSave,
        edges: state.edges,
        chatHistories: state.chatHistories,
      });
      try {
        // First, delete the existing document
        await deleteDoc(userDocRef);
        
        // Then, create a new document with the current state
        await setDoc(userDocRef, dataToSave);
        
        console.log('Data saved successfully');
        // Clear the deletedNodes array after successful save
        dispatch({ type: 'SET_DELETED_NODES', payload: [] });
      } catch (error) {
        console.error('Error saving data: ', error);
      }
    }
  }, [state.user, state.nodes, state.edges, state.chatHistories]);

  const getNodeLineage = useCallback((nodeId) => {
    const lineage = [];
    let currentId = nodeId;

    while (currentId) {
      lineage.unshift(currentId);
      const parentEdge = state.edges.find(edge => edge.target === currentId);
      currentId = parentEdge ? parentEdge.source : null;
    }

    return lineage;
  }, [state.edges]);

  const getCombinedChatHistory = useCallback((nodeId) => {
    const lineage = getNodeLineage(nodeId);
    return lineage.flatMap(id => state.chatHistories[id] || []);
  }, [getNodeLineage, state.chatHistories]);

  const generateAIResponse = useCallback(async (nodeId, messages) => {
    dispatch({ type: 'SET_AI_LOADING', payload: { nodeId, loading: true } });
    try {
      console.log('Generating AI response for node:', nodeId);
      const combinedHistory = getCombinedChatHistory(nodeId);
      console.log('Combined history:', combinedHistory);
      
      const contextualizedMessages = [
        ...combinedHistory,
        ...messages
      ];
      console.log('Contextualized messages:', contextualizedMessages);
      
      const aiResponse = await openaiService.generateResponse(contextualizedMessages);
      console.log('AI response received:', aiResponse);
      
      const aiMessage = { text: aiResponse, sender: 'ai' };
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { nodeId, message: aiMessage }
      });
      return aiMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { nodeId, message: { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' } }
      });
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: { nodeId, loading: false } });
    }
  }, [dispatch, getCombinedChatHistory]);

  return (
    <FlowChartContext.Provider value={{ state, dispatch, saveUserData, generateAIResponse, getCombinedChatHistory }}>
      {children}
    </FlowChartContext.Provider>
  );
}

export function useFlowChart() {
  const context = useContext(FlowChartContext);
  if (!context) {
    throw new Error('useFlowChart must be used within a FlowChartProvider');
  }
  return context;
}