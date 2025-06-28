import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Will be .tsx
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx'; // Will be .tsx
import { initSVGFixes } from './utils/svgFix';

// Initialize SVG fixes to prevent validation errors during payment flow
initSVGFixes();

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element. Please ensure an element with id "root" exists in your HTML.');
}