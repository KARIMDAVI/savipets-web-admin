import React from 'react';
import ReactDOM from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19';
import App from './App';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { applySecurityHeaders } from './features/crm/utils/securityHeaders';

// ✅ IMMEDIATE LOG - Runs before React even initializes
console.log('🚀 [main.tsx] Application starting at:', new Date().toISOString());
console.log('🚀 [main.tsx] Window location:', window.location.href);

// Apply security headers on app initialization
applySecurityHeaders();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);