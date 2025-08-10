import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Find the root element in the DOM.
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has an element with id='root'.");
}
