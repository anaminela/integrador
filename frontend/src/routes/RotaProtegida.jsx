// =============================================================
// GUARDA DE ROTA: RotaProtegida
// -------------------------------------------------------------
// Envolve rotas que exigem autenticação. Comportamento:
//   • Enquanto reidrata a sessão → mostra spinner
//   • Sem usuário → redireciona para /login (guardando a origem)
//   • Com "papeis" definidos → checa autorização (403 → /sem-permissao)
// Implementa RF2 (guarda de rotas) e a segurança por perfil.
// =============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Carregando from '../views/components/Carregando';

export default function RotaProtegida({ children, papeis }) {
  const { autenticado, usuario, carregando } = useAuth();
  const location = useLocation();

  // Ainda verificando a sessão salva.
  if (carregando) {
    return <Carregando texto="Verificando sessão..." />;
  }

  // Não autenticado → login.
  if (!autenticado) {
    return <Navigate to="/login" state={{ de: location.pathname }} replace />;
  }

  // Autorização por papel (quando a rota restringe).
  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}
