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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      color: '#e0e0e0',
      padding: '0 2rem'
    }}>
      <div style={{ 
        width: '40%',
        textAlign: 'left',
        paddingRight: '2rem'
      }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Welcome to FlowChat AI</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Create interactive flowcharts with AI-powered chat in each node. 
          Visualize your ideas, break down complex concepts, and explore different 
          branches of thought with the help of AI assistance.
        </p>
        <button 
          onClick={handleGoogleSignIn} 
          style={{ 
            padding: '12px 24px', 
            fontSize: '1rem',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          Sign in with Google
        </button>
      </div>
      <div style={{
        width: '60%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img 
          src="/interface.png" 
          alt="FlowChat AI Interface" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)'
          }}
        />
      </div>
    </div>
  );
};

export default Auth;