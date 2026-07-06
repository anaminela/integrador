// =============================================================
// SERVICE: Administradores / Internos (/admins)
// -------------------------------------------------------------
// Gestão de usuários internos (ADMINISTRADOR e FUNCIONARIO) e
// métricas gerais do sistema (RF15/RF16).
// =============================================================
import { apiClient } from './apiClient';

export const adminService = {
  // Lista internos; filtro opcional por tipo_perfil.
  listar: (tipo_perfil) => apiClient.get('/admins', { params: { tipo_perfil } }),

  // Métricas gerais (acesso FUNCIONARIO/ADMINISTRADOR).
  metricas: () => apiClient.get('/admins/metricas'),

  // Detalha um interno.
  buscarPorId: (id) => apiClient.get(`/admins/${id}`),

  // Cria admin/funcionário (acesso ADMINISTRADOR).
  criar: (dados) => apiClient.post('/admins', dados),

  // Atualiza dados (pode alterar tipo_perfil).
  atualizar: (id, dados) => apiClient.put(`/admins/${id}`, dados),

  // Reverte soft delete (reativa o usuário).
  reativar: (id) => apiClient.patch(`/admins/${id}/reativar`),

  // Soft delete.
  remover: (id) => apiClient.delete(`/admins/${id}`),
};
