// =============================================================
// SERVICE: Produtos / Estoque / Cardápio (/produtos)
// -------------------------------------------------------------
// Cobre RF3 (cardápio), RF8/8.1/8.2/8.3 (estoque, movimentação,
// alertas e relatório).
// =============================================================
import { apiClient } from './apiClient';

export const produtoService = {
  // Cardápio: produtos ativos com quantidade > 0 (RF3).
  cardapio: () => apiClient.get('/produtos/cardapio'),

  // Produtos no/abaixo do estoque mínimo (RF8.2).
  alertas: () => apiClient.get('/produtos/alertas'),

  // Relatório de movimentação por período (RF8.3).
  relatorio: (data_inicio, data_fim) =>
    apiClient.get('/produtos/relatorio', { params: { data_inicio, data_fim } }),

  // Lista produtos ativos (FUNCIONARIO/ADMINISTRADOR).
  listar: () => apiClient.get('/produtos'),

  // Detalha produto.
  buscarPorId: (id) => apiClient.get(`/produtos/${id}`),

  // Cria produto (ADMINISTRADOR) — RF8.
  criar: (dados) => apiClient.post('/produtos', dados),

  // Movimenta estoque: entrada (compra) ou saída (venda). Saída lança receita.
  movimentar: (id, dados) => apiClient.post(`/produtos/${id}/movimentar`, dados),

  // Atualiza produto.
  atualizar: (id, dados) => apiClient.put(`/produtos/${id}`, dados),

  // Soft delete.
  remover: (id) => apiClient.delete(`/produtos/${id}`),
};
