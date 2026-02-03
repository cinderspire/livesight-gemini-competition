import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LiveSightProvider } from './contexts/LiveSightContext';
import { ErrorBoundary } from './components';
import './index.css';

/**
 * LiveSight Application Entry Point
 */

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Ensure your HTML has a <div id="root"></div>');
}

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render application with providers
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LiveSightProvider>
        <App />
      </LiveSightProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
