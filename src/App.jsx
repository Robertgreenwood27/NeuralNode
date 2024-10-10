import React, { useState, useEffect } from 'react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import FlowChart from './components/FlowChart/FlowChart';
import Auth from './components/Auth/Auth';
import './components/FlowChart/styles/FlowChartBase.css';
import './components/FlowChart/styles/GeneralStyles.css';
import './components/FlowChart/styles/ChatInterfaceStyles.css';
import './components/FlowChart/styles/FullScreenNodeStyles.css';
import './components/FlowChart/styles/FABStyles.css';
import './components/FlowChart/styles/BottomNavStyles.css';
import './components/FlowChart/styles/ResponsiveStyles.css';
import { FlowChartProvider } from './context/FlowChartProvider'; // Update this line

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
      <FlowChartProvider>
        {user ? <FlowChart /> : <Auth />}
      </FlowChartProvider>
    </div>
  );
}

export default App;