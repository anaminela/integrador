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
