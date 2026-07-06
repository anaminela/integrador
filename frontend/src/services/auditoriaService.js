import { apiClient } from './apiClient';

export const auditoriaService = {
  logs: (limite = 100) => apiClient.get('/auditoria/logs', { params: { limite } }),

  dashboard: (data_inicio, data_fim) =>
    apiClient.get('/auditoria/dashboard', { params: { data_inicio, data_fim } }),
};
