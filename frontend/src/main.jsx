// =============================================================
// PONTO DE ENTRADA DO FRONTEND (main.jsx)
// -------------------------------------------------------------
// É aqui que o React "monta" a aplicação dentro do <div id="root">
// definido no index.html. Importamos também o tema global de CSS.
// =============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tema.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
