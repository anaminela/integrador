// =============================================================
// SERVICE: Autenticação (/auth)
// -------------------------------------------------------------
// Camada fina que traduz as ações de autenticação em chamadas
// HTTP. Não guarda estado — quem guarda é o AuthContext.
// =============================================================
import { apiClient } from './apiClient';

export const authService = {
  // POST /auth/login — rota pública (autenticado: false).
  login: (login, senha) =>
    apiClient.post('/auth/login', { login, senha }, { autenticado: false }),

  // POST /auth/logout — apenas informa o backend; o cliente descarta o token.
  logout: () => apiClient.post('/auth/logout'),

  // GET /auth/me — reidrata os dados do usuário logado ao recarregar a página.
  eu: () => apiClient.get('/auth/me'),

  // POST /auth/esqueci-senha — solicita token de recuperação por e-mail.
  esqueciSenha: (email) =>
    apiClient.post('/auth/esqueci-senha', { email }, { autenticado: false }),

  // POST /auth/redefinir-senha — troca a senha usando o token de 6 dígitos.
  redefinirSenha: (email, token, nova_senha) =>
    apiClient.post(
      '/auth/redefinir-senha',
      { email, token, nova_senha },
      { autenticado: false },
    ),
};
