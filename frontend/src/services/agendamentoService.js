import { apiClient } from './apiClient';

export const agendamentoService = {
  disponibilidade: (quadra_id, data) =>
    apiClient.get('/agendamentos/disponibilidade', { params: { quadra_id, data } }),

  listar: (filtros = {}) => apiClient.get('/agendamentos', { params: filtros }),

  buscarPorId: (id) => apiClient.get(`/agendamentos/${id}`),

  criar: (dados) => apiClient.post('/agendamentos', dados),

  cancelar: (id) => apiClient.delete(`/agendamentos/${id}/cancelar`),

  atualizarStatus: (id, status) =>
    apiClient.patch(`/agendamentos/${id}/status`, { status }),

  entrarNaFila: (dados) => apiClient.post('/agendamentos/fila', dados),

  listarFila: (quadra_id, data, hora_inicio) =>
    apiClient.get('/agendamentos/fila', { params: { quadra_id, data, hora_inicio } }),

  sairDaFila: (id) => apiClient.delete(`/agendamentos/fila/${id}`),
};
