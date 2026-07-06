import { CHAVE_TOKEN } from '../utils/constantes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(mensagem, status, corpo) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.corpo = corpo;
  }
}

function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

async function requisicao(metodo, caminho, { body, params, autenticado = true } = {}) {

  let url = `${API_URL}${caminho}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        query.append(chave, valor);
      }
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { 'Content-Type': 'application/json' };

  if (autenticado) {
    const token = obterToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const config = { method: metodo, headers };
  if (body !== undefined) config.body = JSON.stringify(body);

  let resposta;
  try {
    resposta = await fetch(url, config);
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
      0,
      null,
    );
  }

  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { mensagem: texto };
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 401) {
      window.dispatchEvent(new CustomEvent('sessao-expirada'));
    }
    const mensagem = dados?.mensagem || `Erro ${resposta.status} na requisição.`;
    throw new ApiError(mensagem, resposta.status, dados);
  }

  return dados;
}

export const apiClient = {
  get: (caminho, opcoes) => requisicao('GET', caminho, opcoes),
  post: (caminho, body, opcoes) => requisicao('POST', caminho, { ...opcoes, body }),
  put: (caminho, body, opcoes) => requisicao('PUT', caminho, { ...opcoes, body }),
  patch: (caminho, body, opcoes) => requisicao('PATCH', caminho, { ...opcoes, body }),
  delete: (caminho, opcoes) => requisicao('DELETE', caminho, opcoes),
};

export { API_URL };
