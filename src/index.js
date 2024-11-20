import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // 确保路径正确

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);