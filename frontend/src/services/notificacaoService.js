// =============================================================
// SERVICE: Notificações (/notificacoes)
// -------------------------------------------------------------
// Cobre RF13 (lembretes de agendamentos/treinos) e RF14 (alertas
// de inadimplência). Substituímos o WhatsApp por notificações
// in-app, conforme o escopo do projeto.
// =============================================================
import { apiClient } from './apiClient';

export const notificacaoService = {
  // Dispara/consulta lembretes de agendamentos e treinos (RF13).
  lembretes: () => apiClient.get('/notificacoes/lembretes'),

  // Alertas de inadimplência e contas a vencer (RF14).
  alertas: () => apiClient.get('/notificacoes/alertas'),
};
