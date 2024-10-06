import React from 'react';
import { auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        zIndex: 4,
        backgroundColor: 'rgba(255, 50, 50, 0.7)',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;