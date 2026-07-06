import { apiClient } from './apiClient';

export const notificacaoService = {
  lembretes: () => apiClient.get('/notificacoes/lembretes'),

  alertas: () => apiClient.get('/notificacoes/alertas'),
};
