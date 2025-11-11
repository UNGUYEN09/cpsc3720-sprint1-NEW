import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css'; 

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
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
