// =============================================================
// SERVICE: Financeiro / Caixa (/financeiro)
// -------------------------------------------------------------
// Cobre RF10 (registrar entradas/saídas), RF11 (status de
// pagamento + desconto mensal) e RF12 (relatório consolidado).
// =============================================================
import { apiClient } from './apiClient';

export const financeiroService = {
  // Relatório consolidado por período: entradas, saídas, saldo (RF12).
  relatorio: (data_inicio, data_fim) =>
    apiClient.get('/financeiro/relatorio', { params: { data_inicio, data_fim } }),

  // Registra uma transação (entrada/saída) — RF10.
  registrar: (dados) => apiClient.post('/financeiro', dados),

  // Atualiza o status de pagamento: pago | pendente | em aberto (RF11).
  atualizarStatus: (id, status) =>
    apiClient.patch(`/financeiro/${id}/status`, { status }),
};
