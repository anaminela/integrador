// =============================================================
// SERVICE: Agendamentos + Fila de espera (/agendamentos)
// -------------------------------------------------------------
// Cobre RF4 (agendar), RF7 (gerir status) e RF9 (fila de espera).
// =============================================================
import { apiClient } from './apiClient';

export const agendamentoService = {
  // Gera os slots de 1h (07:00–22:00) com disponibilidade e preço.
  disponibilidade: (quadra_id, data) =>
    apiClient.get('/agendamentos/disponibilidade', { params: { quadra_id, data } }),

  // Lista agendamentos (cliente vê os próprios; interno vê todos).
  listar: (filtros = {}) => apiClient.get('/agendamentos', { params: filtros }),

  // Detalha um agendamento.
  buscarPorId: (id) => apiClient.get(`/agendamentos/${id}`),

  // Cria um agendamento (pode retornar 409 em caso de conflito).
  criar: (dados) => apiClient.post('/agendamentos', dados),

  // Cancela (soft) um agendamento e notifica o próximo da fila.
  cancelar: (id) => apiClient.delete(`/agendamentos/${id}/cancelar`),

  // Aceitar/recusar/cancelar (RF7) — acesso FUNCIONARIO/ADMINISTRADOR.
  atualizarStatus: (id, status) =>
    apiClient.patch(`/agendamentos/${id}/status`, { status }),

  // Entra na fila de espera de um horário ocupado (RF9).
  entrarNaFila: (dados) => apiClient.post('/agendamentos/fila', dados),

  // Lista a fila de um slot específico.
  listarFila: (quadra_id, data, hora_inicio) =>
    apiClient.get('/agendamentos/fila', { params: { quadra_id, data, hora_inicio } }),

  // Sai da fila de espera.
  sairDaFila: (id) => apiClient.delete(`/agendamentos/fila/${id}`),
};
