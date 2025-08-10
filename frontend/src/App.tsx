import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntegrationsPage from './pages/IntegrationsPage';
import './index.css';

const App: React.FC = () => {
return (
  <Router>
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-cyan-50 via-emerald-50 to-amber-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-300/30 to-violet-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-cyan-300/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-emerald-300/30 to-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-amber-300/30 to-orange-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-slate-100/50 bg-[size:50px_50px] opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Routes>
          <Route path="/" element={<IntegrationsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
        </Routes>
      </div>
    </div>
  </Router>
);
}

export default App;