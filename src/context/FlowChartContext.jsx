import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const FlowChartContext = createContext();

const initialState = {
  user: null,
  nodes: [],
  edges: [],
  chatHistories: {},
  isLoading: true,
  dataLoaded: false,
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
      const { nodeId, message } = action.payload;
      return {
        ...state,
        chatHistories: {
          ...state.chatHistories,
          [nodeId]: [...(state.chatHistories[nodeId] || []), message],
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
        // Clear data when user signs out
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
        ...node,
        data: {
          ...node.data,
          onDimensionsChange: null // Remove the function
        }
      }));
      const dataToSave = removeCircularReferences({
        nodes: nodesToSave,
        edges: state.edges,
        chatHistories: state.chatHistories,
      });
      try {
        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log('Data saved successfully');
      } catch (error) {
        console.error('Error saving data: ', error);
      }
    }
  }, [state.user, state.nodes, state.edges, state.chatHistories]);

  return (
    <FlowChartContext.Provider value={{ state, dispatch, saveUserData }}>
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