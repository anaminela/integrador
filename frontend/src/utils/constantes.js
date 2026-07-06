// =============================================================
// CONSTANTES GLOBAIS DA APLICAÇÃO
// -------------------------------------------------------------
// Centralizamos aqui valores fixos usados em vários lugares:
// perfis de usuário, status, categorias, cores da agenda, etc.
// Manter tudo num único arquivo evita "strings mágicas"
// espalhadas pelo código e facilita a manutenção.
// =============================================================

// Perfis efetivos do sistema (derivados de perfil + tipo_perfil do backend).
export const PERFIS = {
  CLIENTE: 'cliente',
  FUNCIONARIO: 'FUNCIONARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
};

// Chave usada no localStorage para persistir a sessão do usuário.
export const CHAVE_TOKEN = 'g2arena_token';
export const CHAVE_USUARIO = 'g2arena_usuario';

// Grade de horários da agenda (07:00 às 22:00, slots de 1h).
export const HORA_ABERTURA = 7;
export const HORA_FECHAMENTO = 22;

// Regra de preço (RF4): horário padrão x horário nobre.
export const PRECO_PADRAO = 60;
export const PRECO_NOBRE = 90;

// Cores usadas na agenda de agendamentos.
export const CORES_AGENDA = {
  DISPONIVEL: '#2e9e6b', // verde
  OCUPADO: '#d64545', // vermelho
  BLOQUEADO: '#8a8f98', // cinza (bloqueado por treino)
};

// Status possíveis de um agendamento.
export const STATUS_AGENDAMENTO = {
  CONFIRMADO: 'confirmado',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
};

// Status financeiros (RF11).
export const STATUS_FINANCEIRO = ['pago', 'pendente', 'em aberto'];

// Métodos de pagamento aceitos.
export const METODOS_PAGAMENTO = ['dinheiro', 'PIX', 'cartão'];

// Categorias financeiras conhecidas.
export const CATEGORIAS_FINANCEIRO = [
  'agendamento_avulso',
  'agendamento_mensal',
  'lanchonete_bar',
  'mensalidade_treino',
  'outros',
];

// Níveis de turma/treino.
export const NIVEIS_TURMA = ['iniciante', 'intermediário', 'avançado'];

// Tipos de agendamento.
export const TIPOS_AGENDAMENTO = ['avulso', 'mensal'];

// Tipos de perfil interno.
export const TIPOS_PERFIL_INTERNO = ['ADMINISTRADOR', 'FUNCIONARIO'];
