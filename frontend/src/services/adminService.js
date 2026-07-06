import { apiClient } from './apiClient';

export const adminService = {
  listar: (tipo_perfil) => apiClient.get('/admins', { params: { tipo_perfil } }),

  metricas: () => apiClient.get('/admins/metricas'),

  buscarPorId: (id) => apiClient.get(`/admins/${id}`),

  criar: (dados) => apiClient.post('/admins', dados),

  atualizar: (id, dados) => apiClient.put(`/admins/${id}`, dados),

  reativar: (id) => apiClient.patch(`/admins/${id}/reativar`),

  remover: (id) => apiClient.delete(`/admins/${id}`),
};
