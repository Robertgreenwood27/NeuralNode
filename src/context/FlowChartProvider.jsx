import React, { useReducer, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import openaiService from '../services/OpenAIService';
import FlowChartContext from './FlowChartContext';
import { initialState, flowChartReducer, removeCircularReferences } from './flowChartReducer';
import * as actions from './flowChartActions';

export function FlowChartProvider({ children }) {
  const [state, dispatch] = useReducer(flowChartReducer, initialState);

  const loadUserData = useCallback(async (userId) => {
    if (state.dataLoaded) return;
    
    dispatch(actions.setLoading(true));
    const userDocRef = doc(db, 'users', userId);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        dispatch(actions.setNodes(userData.nodes || []));
        dispatch(actions.setEdges(userData.edges || []));
        dispatch(actions.setChatHistories(userData.chatHistories || {}));
      }
      dispatch(actions.setDataLoaded(true));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.dataLoaded]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(actions.setUser(user));
      if (user) {
        loadUserData(user.uid);
      } else {
        dispatch(actions.setNodes([]));
        dispatch(actions.setEdges([]));
        dispatch(actions.setChatHistories({}));
        dispatch(actions.setLoading(false));
        dispatch(actions.setDataLoaded(false));
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
        await deleteDoc(userDocRef);
        await setDoc(userDocRef, dataToSave);
        console.log('Data saved successfully');
        dispatch(actions.setDeletedNodes([]));
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
    dispatch(actions.setAILoading(nodeId, true));
    try {
      const combinedHistory = getCombinedChatHistory(nodeId);
      const contextualizedMessages = [...combinedHistory, ...messages];
      const aiResponseGenerator = await openaiService.generateResponse(contextualizedMessages);
      
      let aiResponseText = '';
      for await (const chunk of aiResponseGenerator) {
        aiResponseText += chunk;
      }

      const aiMessage = { id: Date.now(), text: aiResponseText, sender: 'ai' };
      dispatch(actions.addMessage(nodeId, aiMessage));
      return aiMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = { id: Date.now(), text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' };
      dispatch(actions.addMessage(nodeId, errorMessage));
      return errorMessage;
    } finally {
      dispatch(actions.setAILoading(nodeId, false));
    }
  }, [dispatch, getCombinedChatHistory]);

  const setFullScreenNode = useCallback((nodeId) => {
    dispatch(actions.setFullScreenNode(nodeId));
  }, []);

  const contextValue = {
    state,
    dispatch,
    saveUserData,
    generateAIResponse,
    getCombinedChatHistory,
    setFullScreenNode
  };

  return (
    <FlowChartContext.Provider value={contextValue}>
      {children}
    </FlowChartContext.Provider>
  );
}