import { apiClient } from './apiClient';

export const financeiroService = {
  relatorio: (data_inicio, data_fim) =>
    apiClient.get('/financeiro/relatorio', { params: { data_inicio, data_fim } }),

  registrar: (dados) => apiClient.post('/financeiro', dados),

  atualizarStatus: (id, status) =>
    apiClient.patch(`/financeiro/${id}/status`, { status }),
};
