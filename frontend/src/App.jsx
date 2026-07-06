// =============================================================
// COMPONENTE RAIZ DA APLICAÇÃO
// -------------------------------------------------------------
// Monta a hierarquia de "providers" (contextos globais) em volta
// do roteador. A ordem importa: quem estiver por fora consegue
// ser usado por quem está dentro.
//   NotificacaoProvider → toasts/central disponíveis em todo lugar
//   AuthProvider        → sessão do usuário
//   AppRouter           → todas as rotas
//   Toasts              → camada visual das notificações
// =============================================================
import { AuthProvider } from './contexts/AuthContext';
import { NotificacaoProvider } from './contexts/NotificacaoContext';
import AppRouter from './routes/AppRouter';
import { Toasts } from './views/components';

export default function App() {
  return (
    <NotificacaoProvider>
      <AuthProvider>
        <AppRouter />
        <Toasts />
      </AuthProvider>
    </NotificacaoProvider>
  );
}
