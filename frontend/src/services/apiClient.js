// =============================================================
// CLIENTE HTTP CENTRAL (apiClient)
// -------------------------------------------------------------
// Toda comunicação com o backend passa por aqui. Este módulo:
//   • Monta a URL base a partir da variável de ambiente VITE_API_URL
//   • Anexa automaticamente o token JWT (Authorization: Bearer)
//   • Serializa/deserializa JSON
//   • Padroniza o tratamento de erros (lança ApiError com detalhes)
//   • Dispara um evento global quando recebe 401 (sessão expirada)
//
// Usamos a Fetch API nativa (sem bibliotecas externas como Axios)
// para manter o projeto leve. Ver TECNOLOGIAS_ALTERNATIVAS.md para
// uma comparação Fetch x Axios.
// =============================================================

import { CHAVE_TOKEN } from '../utils/constantes';

// URL base vinda do .env (ex.: http://localhost:3000/api/v1).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Erro customizado: carrega o status HTTP e o corpo retornado pela API,
// permitindo que as telas exibam a mensagem exata do backend.
export class ApiError extends Error {
  constructor(mensagem, status, corpo) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.corpo = corpo;
  }
}

// Lê o token salvo no navegador (persistência de sessão).
function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

// Função central que executa a requisição.
// metodo: GET/POST/PUT/PATCH/DELETE
// caminho: rota relativa (ex.: "/auth/login")
// opcoes: { body, params, autenticado }
async function requisicao(metodo, caminho, { body, params, autenticado = true } = {}) {
  // Monta a query string a partir de "params" (ignorando valores vazios).
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

  // Cabeçalhos padrão.
  const headers = { 'Content-Type': 'application/json' };

  // Anexa o token JWT quando a rota exige autenticação.
  if (autenticado) {
    const token = obterToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Configuração do fetch.
  const config = { method: metodo, headers };
  if (body !== undefined) config.body = JSON.stringify(body);

  let resposta;
  try {
    resposta = await fetch(url, config);
  } catch {
    // Falha de rede (backend offline, CORS, etc).
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
      0,
      null,
    );
  }

  // Tenta interpretar o corpo como JSON (pode ser vazio em 204).
  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { mensagem: texto };
    }
  }

  // Erro HTTP: lança ApiError com a mensagem do backend.
  if (!resposta.ok) {
    // 401 → sessão inválida/expirada. Avisa a aplicação para deslogar.
    if (resposta.status === 401) {
      window.dispatchEvent(new CustomEvent('sessao-expirada'));
    }
    const mensagem = dados?.mensagem || `Erro ${resposta.status} na requisição.`;
    throw new ApiError(mensagem, resposta.status, dados);
  }

  return dados;
}

// Interface pública do cliente: um método por verbo HTTP.
export const apiClient = {
  get: (caminho, opcoes) => requisicao('GET', caminho, opcoes),
  post: (caminho, body, opcoes) => requisicao('POST', caminho, { ...opcoes, body }),
  put: (caminho, body, opcoes) => requisicao('PUT', caminho, { ...opcoes, body }),
  patch: (caminho, body, opcoes) => requisicao('PATCH', caminho, { ...opcoes, body }),
  delete: (caminho, opcoes) => requisicao('DELETE', caminho, opcoes),
};

export { API_URL };
