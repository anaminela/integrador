// =============================================================
// SERVICE: Quadras (/quadras)
// -------------------------------------------------------------
// Leitura é pública (GET); criação/edição exigem FUNCIONARIO/
// ADMINISTRADOR; remoção exige ADMINISTRADOR.
// =============================================================
import { apiClient } from './apiClient';

export const quadraService = {
  // Lista todas as quadras (público).
  listar: () => apiClient.get('/quadras', { autenticado: false }),

  // Detalha uma quadra (público).
  buscarPorId: (id) => apiClient.get(`/quadras/${id}`, { autenticado: false }),

  // Cria quadra (FUNCIONARIO/ADMINISTRADOR).
  criar: (dados) => apiClient.post('/quadras', dados),

  // Atualiza quadra.
  atualizar: (id, dados) => apiClient.put(`/quadras/${id}`, dados),

  // Remove quadra (ADMINISTRADOR).
  remover: (id) => apiClient.delete(`/quadras/${id}`),
};
