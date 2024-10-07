import React from 'react';
import { auth } from '../../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Auth = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#e0e0e0' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to FlowChat AI</h1>
        <p style={{ marginBottom: '1rem' }}>
          Create interactive flowcharts with AI-powered chat in each node. 
          Visualize your ideas, break down complex concepts, and explore different 
          branches of thought with the help of AI assistance.
        </p>
      </div>
      <button 
        onClick={handleGoogleSignIn} 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;