// =============================================================
// CONTEXT: Autenticação (estado global de sessão)
// -------------------------------------------------------------
// A Context API do React permite compartilhar estado entre
// componentes sem "prop drilling" (passar props manualmente por
// vários níveis). Aqui guardamos:
//   • o usuário logado (instância de Usuario)
//   • funções de login/logout/registro
//   • estado de carregamento inicial (reidratação da sessão)
//
// Persistência: token e usuário ficam no localStorage, então a
// sessão sobrevive a recarregamentos de página (RF2/RF17).
// =============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { Usuario } from '../models';
import { CHAVE_TOKEN, CHAVE_USUARIO } from '../utils/constantes';

// Cria o contexto (valor padrão preenchido pelo Provider).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado do usuário logado. null = deslogado.
  const [usuario, setUsuario] = useState(null);
  // Enquanto true, ainda estamos verificando se há sessão salva.
  const [carregando, setCarregando] = useState(true);

  // ---------------------------------------------------------
  // Reidratação: ao montar a aplicação, tenta recuperar a sessão
  // salva no localStorage e confirmá-la via GET /auth/me.
  // ---------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN);
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

    if (!token) {
      setCarregando(false);
      return;
    }

    // Otimista: usa o usuário salvo enquanto valida no backend.
    if (usuarioSalvo) {
      try {
        setUsuario(new Usuario(JSON.parse(usuarioSalvo)));
      } catch {
        // ignora JSON corrompido
      }
    }

    // Confirma a validade do token no servidor.
    authService
      .eu()
      .then((resp) => {
        const dados = resp.usuario ?? resp.data ?? resp;
        setUsuario(new Usuario(dados));
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
      })
      .catch(() => {
        // Token inválido/expirado → limpa a sessão.
        limparSessao();
      })
      .finally(() => setCarregando(false));
  }, []);

  // ---------------------------------------------------------
  // Ouvinte global: o apiClient dispara "sessao-expirada" ao
  // receber 401. Aqui reagimos limpando a sessão.
  // ---------------------------------------------------------
  useEffect(() => {
    const aoExpirar = () => limparSessao();
    window.addEventListener('sessao-expirada', aoExpirar);
    return () => window.removeEventListener('sessao-expirada', aoExpirar);
  }, []);

  // Remove token e usuário do storage e do estado.
  function limparSessao() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    setUsuario(null);
  }

  // ---------------------------------------------------------
  // login(login, senha): autentica e persiste a sessão.
  // ---------------------------------------------------------
  const login = useCallback(async (loginInput, senha) => {
    const resp = await authService.login(loginInput, senha);
    // resp = { status, token, expira_em, usuario: {...} }
    localStorage.setItem(CHAVE_TOKEN, resp.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resp.usuario));
    setUsuario(new Usuario(resp.usuario));
    return resp;
  }, []);

  // ---------------------------------------------------------
  // logout(): informa o backend e descarta o token (RF17).
  // ---------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Mesmo se falhar no backend, descartamos localmente.
    } finally {
      limparSessao();
    }
  }, []);

  // Atualiza os dados do usuário no estado (ex.: após editar o perfil).
  const atualizarUsuario = useCallback((dados) => {
    const novo = new Usuario(dados);
    setUsuario(novo);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
  }, []);

  // Valor exposto pelo contexto.
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

// Hook de conveniência para consumir o contexto de autenticação.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
