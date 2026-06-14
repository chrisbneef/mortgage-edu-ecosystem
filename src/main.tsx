import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { installBackBridge, postToNative } from '@/native/bridge';
import './index.css';

installBackBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

postToNative({ type: 'ready' });
