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
      flexDirection: 'column',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      color: '#e0e0e0',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '800px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Welcome to FlowChat AI</h1>
        <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          Create interactive flowcharts with AI-powered chat in each node. 
          Visualize your ideas, break down complex concepts, and explore different 
          branches of thought with the help of AI assistance.
        </p>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        flex: '1 1 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1rem 0'
      }}>
        <img 
          src="/interface.png" 
          alt="FlowChat AI Interface" 
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)'
          }}
        />
      </div>
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
          transition: 'background-color 0.3s ease',
          marginTop: '2rem',
          width: '90%',
          maxWidth: '300px'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;