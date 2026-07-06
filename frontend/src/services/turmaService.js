// =============================================================
// SERVICE: Turmas / Treinos (/turmas)
// -------------------------------------------------------------
// Cobre RF5 (inscrição em treinos), RF6 (dashboard do professor)
// e RF18 (cadastro de turmas).
// =============================================================
import { apiClient } from './apiClient';

export const turmaService = {
  // Dashboard/agenda do professor com interessados na fila (RF6).
  dashboard: () => apiClient.get('/turmas/dashboard'),

  // Lista turmas com matriculados e vagas disponíveis.
  listar: () => apiClient.get('/turmas'),

  // Detalha turma (alunos + fila).
  buscarPorId: (id) => apiClient.get(`/turmas/${id}`),

  // Cria turma (ADMINISTRADOR) — RF18.
  criar: (dados) => apiClient.post('/turmas', dados),

  // Inscreve cliente na turma (exige telefone de contato — RF5).
  inscrever: (id, telefone) =>
    apiClient.post(`/turmas/${id}/inscrever`, { telefone }),

  // Entra na fila da turma (quando lotada).
  entrarNaFila: (id) => apiClient.post(`/turmas/${id}/fila`, {}),
};
