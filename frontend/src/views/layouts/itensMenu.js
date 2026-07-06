// =============================================================
// CONFIGURAÇÃO DO MENU DE NAVEGAÇÃO
// -------------------------------------------------------------
// Define os itens do menu lateral e QUEM pode ver cada um.
// A propriedade "perfis" lista os papéis autorizados. O menu é
// renderizado conforme o perfil do usuário logado (RF2).
//   - "cliente"       → Cliente
//   - "FUNCIONARIO"    → Funcionário
//   - "ADMINISTRADOR"  → Administrador
// =============================================================
import { PERFIS } from '../../utils/constantes';

const TODOS = [PERFIS.CLIENTE, PERFIS.FUNCIONARIO, PERFIS.ADMINISTRADOR];
const INTERNOS = [PERFIS.FUNCIONARIO, PERFIS.ADMINISTRADOR];
const SO_ADMIN = [PERFIS.ADMINISTRADOR];

export const ITENS_MENU = [
  { rotulo: 'Início', caminho: '/', icone: '🏠', perfis: TODOS },
  { rotulo: 'Agendar Quadra', caminho: '/agendamentos', icone: '📅', perfis: TODOS },
  { rotulo: 'Turmas e Treinos', caminho: '/turmas', icone: '🏐', perfis: TODOS },
  { rotulo: 'Cardápio', caminho: '/cardapio', icone: '🥤', perfis: TODOS },
  { rotulo: 'Notificações', caminho: '/notificacoes', icone: '🔔', perfis: TODOS },

  // --- Área interna (funcionário/admin) ---
  { rotulo: 'Painel do Professor', caminho: '/painel-professor', icone: '📋', perfis: INTERNOS, grupo: 'Gestão' },
  { rotulo: 'Gestão de Agendamentos', caminho: '/gestao-agendamentos', icone: '🗂️', perfis: INTERNOS, grupo: 'Gestão' },
  { rotulo: 'Quadras', caminho: '/quadras', icone: '🏟️', perfis: INTERNOS, grupo: 'Gestão' },
  { rotulo: 'Produtos / Estoque', caminho: '/produtos', icone: '📦', perfis: INTERNOS, grupo: 'Gestão' },
  { rotulo: 'Financeiro', caminho: '/financeiro', icone: '💰', perfis: INTERNOS, grupo: 'Gestão' },

  // --- Área administrativa (só admin) ---
  { rotulo: 'Usuários', caminho: '/usuarios', icone: '👥', perfis: SO_ADMIN, grupo: 'Administração' },
  { rotulo: 'Cadastro de Turmas', caminho: '/admin-turmas', icone: '➕', perfis: SO_ADMIN, grupo: 'Administração' },
  { rotulo: 'Auditoria e Métricas', caminho: '/auditoria', icone: '📊', perfis: SO_ADMIN, grupo: 'Administração' },
];

// Filtra os itens visíveis para um determinado papel.
export function itensParaPapel(papel) {
  return ITENS_MENU.filter((item) => item.perfis.includes(papel));
}
