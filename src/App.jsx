import React, { useState, useEffect } from 'react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import FlowChart from './components/FlowChart/FlowChart';
import Auth from './components/Auth/Auth';
import './components/FlowChart/FlowChartStyles.css'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {user ? <FlowChart /> : <Auth />}
    </div>
  );
}

export default App;