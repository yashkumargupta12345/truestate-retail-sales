import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './pages/DashBoard.jsx';

function App() {
  return (
    <Router future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </Router>
  );
}

export default App;