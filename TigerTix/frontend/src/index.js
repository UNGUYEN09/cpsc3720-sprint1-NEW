import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a root div dynamically if it doesn't exist
let rootDiv = document.getElementById('root');
if (!rootDiv) {
  rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

const root = ReactDOM.createRoot(rootDiv);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
