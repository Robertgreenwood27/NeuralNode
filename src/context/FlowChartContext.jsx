import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const FlowChartContext = createContext();

const initialState = {
  user: null,
  nodes: [],
  edges: [],
  chatHistories: {},
};

function flowChartReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
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

export function FlowChartProvider({ children }) {
  const [state, dispatch] = useReducer(flowChartReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      if (user) {
        loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      dispatch({ type: 'SET_NODES', payload: userData.nodes || [] });
      dispatch({ type: 'SET_EDGES', payload: userData.edges || [] });
    }
  };

  const saveUserData = async () => {
    if (state.user) {
      const userDocRef = doc(db, 'users', state.user.uid);
      await setDoc(userDocRef, {
        nodes: state.nodes,
        edges: state.edges,
      }, { merge: true });
    }
  };

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