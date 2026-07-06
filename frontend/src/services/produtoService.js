import { apiClient } from './apiClient';

export const produtoService = {
  cardapio: () => apiClient.get('/produtos/cardapio'),

  alertas: () => apiClient.get('/produtos/alertas'),

  relatorio: (data_inicio, data_fim) =>
    apiClient.get('/produtos/relatorio', { params: { data_inicio, data_fim } }),

  listar: () => apiClient.get('/produtos'),

  buscarPorId: (id) => apiClient.get(`/produtos/${id}`),

  criar: (dados) => apiClient.post('/produtos', dados),

  movimentar: (id, dados) => apiClient.post(`/produtos/${id}/movimentar`, dados),

  atualizar: (id, dados) => apiClient.put(`/produtos/${id}`, dados),

  remover: (id) => apiClient.delete(`/produtos/${id}`),
};
