// =============================================================
// SERVICE: Auditoria / Logs (/auditoria)
// -------------------------------------------------------------
// Cobre RF16 (histórico de operações + métricas do sistema).
// Acesso restrito ao ADMINISTRADOR.
// =============================================================
import { apiClient } from './apiClient';

export const auditoriaService = {
  // Histórico de operações (POST/PUT/PATCH/DELETE) — RF16.
  logs: (limite = 100) => apiClient.get('/auditoria/logs', { params: { limite } }),

  // Métricas: total de usuários, novos no período, agendamentos, média (RF16).
  dashboard: (data_inicio, data_fim) =>
    apiClient.get('/auditoria/dashboard', { params: { data_inicio, data_fim } }),
};
