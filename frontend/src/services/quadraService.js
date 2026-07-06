import { apiClient } from './apiClient';

export const quadraService = {
  listar: () => apiClient.get('/quadras', { autenticado: false }),

  buscarPorId: (id) => apiClient.get(`/quadras/${id}`, { autenticado: false }),

  criar: (dados) => apiClient.post('/quadras', dados),

  atualizar: (id, dados) => apiClient.put(`/quadras/${id}`, dados),

  remover: (id) => apiClient.delete(`/quadras/${id}`),
};
