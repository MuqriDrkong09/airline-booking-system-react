import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Bootstrap shared Axios client + interceptors before feature modules run.
import '@/services/api';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
