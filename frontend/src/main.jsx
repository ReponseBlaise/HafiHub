import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('[main.jsx] Starting React application');
console.log('[main.jsx] About to create React root');

const rootElement = document.getElementById('root');
console.log('[main.jsx] Root element:', rootElement);

if (!rootElement) {
  console.error('[main.jsx] ERROR: Root element not found!');
} else {
  console.log('[main.jsx] Root element found, mounting React');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('[main.jsx] React mounted successfully');
}
