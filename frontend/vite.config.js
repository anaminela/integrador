// =============================================================
// CONFIGURAÇÃO DO VITE (bundler/servidor de desenvolvimento)
// -------------------------------------------------------------
// O Vite é a ferramenta que:
//   • Sobe um servidor de desenvolvimento rápido (HMR)
//   • Empacota (build) o projeto para produção
// Aqui registramos o plugin de React (JSX/Fast Refresh) e
// definimos a porta padrão do frontend (3001) para não colidir
// com o backend (que roda na porta 3000).
// =============================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true, // permite acesso externo (preview URL)
  },
  preview: {
    port: 3001,
    host: true,
  },
});
