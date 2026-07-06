import { apiClient } from './apiClient';

export const usuarioService = {
  listar: () => apiClient.get('/usuarios'),

  buscarPorId: (id) => apiClient.get(`/usuarios/${id}`),

  cadastrar: (dados) => apiClient.post('/usuarios', dados, { autenticado: false }),

  atualizar: (id, dados) => apiClient.put(`/usuarios/${id}`, dados),

  remover: (id) => apiClient.delete(`/usuarios/${id}`),
};
