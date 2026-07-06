// =============================================================
// SERVICE: Usuários / Clientes (/usuarios)
// -------------------------------------------------------------
// CRUD de clientes. O cadastro (create) é público — usado na
// tela de registro. Os demais exigem token.
// =============================================================
import { apiClient } from './apiClient';

export const usuarioService = {
  // Lista todos os clientes (acesso: FUNCIONARIO/ADMINISTRADOR).
  listar: () => apiClient.get('/usuarios'),

  // Detalha um cliente pelo id.
  buscarPorId: (id) => apiClient.get(`/usuarios/${id}`),

  // Cadastro público de cliente (exige aceite_termos = true).
  cadastrar: (dados) => apiClient.post('/usuarios', dados, { autenticado: false }),

  // Atualiza os dados de um cliente (o próprio ou admin).
  atualizar: (id, dados) => apiClient.put(`/usuarios/${id}`, dados),

  // Soft delete (desativa o cliente — acesso ADMINISTRADOR).
  remover: (id) => apiClient.delete(`/usuarios/${id}`),
};
