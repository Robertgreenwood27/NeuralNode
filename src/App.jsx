import React from 'react'
import FlowChart from './components/FlowChart'
import './flow-chart-styles.css';




function App() {
  return (
    <div className="App" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <FlowChart />
    </div>
  )
}

export default App