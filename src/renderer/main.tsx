import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
