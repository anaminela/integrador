import { apiClient } from './apiClient';

export const turmaService = {
  dashboard: () => apiClient.get('/turmas/dashboard'),

  listar: () => apiClient.get('/turmas'),

  buscarPorId: (id) => apiClient.get(`/turmas/${id}`),

  criar: (dados) => apiClient.post('/turmas', dados),

  inscrever: (id, telefone) =>
    apiClient.post(`/turmas/${id}/inscrever`, { telefone }),

  entrarNaFila: (id) => apiClient.post(`/turmas/${id}/fila`, {}),
};
