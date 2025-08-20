import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Skapa root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendera appen
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);