export const PERFIS = {
  CLIENTE: 'cliente',
  FUNCIONARIO: 'FUNCIONARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
};

export const CHAVE_TOKEN = 'g2arena_token';
export const CHAVE_USUARIO = 'g2arena_usuario';

export const HORA_ABERTURA = 7;
export const HORA_FECHAMENTO = 22;
export const PRECO_PADRAO = 60;
export const PRECO_NOBRE = 90;

export const CORES_AGENDA = {
  DISPONIVEL: '#2e9e6b', // verde
  OCUPADO: '#d64545', // vermelho
  BLOQUEADO: '#8a8f98', // cinza (bloqueado por treino)
};

export const STATUS_AGENDAMENTO = {
  CONFIRMADO: 'confirmado',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
};

export const STATUS_FINANCEIRO = ['pago', 'pendente', 'em aberto'];

export const METODOS_PAGAMENTO = ['dinheiro', 'PIX', 'cartão'];

export const CATEGORIAS_FINANCEIRO = [
  'agendamento_avulso',
  'agendamento_mensal',
  'lanchonete_bar',
  'mensalidade_treino',
  'outros',
];

export const NIVEIS_TURMA = ['iniciante', 'intermediário', 'avançado'];

export const TIPOS_AGENDAMENTO = ['avulso', 'mensal'];

export const TIPOS_PERFIL_INTERNO = ['ADMINISTRADOR', 'FUNCIONARIO'];
