import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './config/i18n';
import App from './app';
import { BrowserRouter } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);