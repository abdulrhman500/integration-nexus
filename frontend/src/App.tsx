import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntegrationsPage from './pages/IntegrationsPage';
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Integration Dashboard
              </h1>
            </div>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<IntegrationsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;