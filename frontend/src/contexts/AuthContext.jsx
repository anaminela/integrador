
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { Usuario } from '../models';
import { CHAVE_TOKEN, CHAVE_USUARIO } from '../utils/constantes';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN);
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

    if (!token) {
      setCarregando(false);
      return;
    }

    if (usuarioSalvo) {
      try {
        setUsuario(new Usuario(JSON.parse(usuarioSalvo)));
      } catch {
      }
    }

    authService
      .eu()
      .then((resp) => {
        const dados = resp.usuario ?? resp.data ?? resp;
        setUsuario(new Usuario(dados));
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
      })
      .catch(() => {
        limparSessao();
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const aoExpirar = () => limparSessao();
    window.addEventListener('sessao-expirada', aoExpirar);
    return () => window.removeEventListener('sessao-expirada', aoExpirar);
  }, []);

  function limparSessao() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    setUsuario(null);
  }

  const login = useCallback(async (loginInput, senha) => {
    const resp = await authService.login(loginInput, senha);
    localStorage.setItem(CHAVE_TOKEN, resp.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resp.usuario));
    setUsuario(new Usuario(resp.usuario));
    return resp;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      limparSessao();
    }
  }, []);

  const atualizarUsuario = useCallback((dados) => {
    const novo = new Usuario(dados);
    setUsuario(novo);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
  }, []);

  const valor = {
    usuario,
    autenticado: Boolean(usuario),
    carregando,
    login,
    logout,
    atualizarUsuario,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
