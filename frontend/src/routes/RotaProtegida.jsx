import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Carregando from '../views/components/Carregando';

export default function RotaProtegida({ children, papeis }) {
  const { autenticado, usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <Carregando texto="Verificando sessão..." />;
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ de: location.pathname }} replace />;
  }

  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}
