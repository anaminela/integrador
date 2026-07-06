// =============================================================
// CAMADA: ROUTES — agendamentoRoutes
//
// MAPA DE PERMISSÕES:
//   GET  disponibilidade  → qualquer autenticado
//   GET  /               → cliente vê os próprios; admin/func vê todos
//   GET  /:id            → cliente vê o próprio; admin/func vê qualquer
//   POST /               → qualquer autenticado (agendamento)
//   DELETE /:id/cancelar → cliente cancela o próprio; admin/func cancela qualquer
//   PATCH /:id/status    → apenas ADMINISTRADOR e FUNCIONARIO (RF7)
//   POST /fila           → qualquer autenticado
//   GET  /fila           → qualquer autenticado
//   DELETE /fila/:id     → qualquer autenticado
//
// ATENÇÃO À ORDEM DAS ROTAS:
//   Rotas com caminhos literais (/disponibilidade, /fila) DEVEM
//   vir ANTES das rotas com parâmetro (/:id), senão o Express
//   interpreta "disponibilidade" como um id.
// =============================================================

const express = require("express");
const router  = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');

const {
  validarDisponibilidade,
  validarPayloadAgendamento,
  validarStatusReserva,
  validarFilaQuery
} = require("../middlewares/validarAgendamento");

const { validarId } = require("../middlewares/validarQuadra");

const AgendamentoController = require("../controllers/AgendamentoController");
const { autenticar, exigirPerfil } = require("../middlewares/autenticar");

// ── Rotas literais (sem parâmetros) — devem vir primeiro ────────

// Consulta de disponibilidade de horários — autenticado, qualquer perfil
router.get(
  "/disponibilidade",
  autenticar,
  validarDisponibilidade,
  AgendamentoController.disponibilidade
);

// Fila de espera — entrar, listar e sair
router.post(
  "/fila",
  autenticar,
  validarPayloadAgendamento,
  AgendamentoController.entrarNaFila
);

router.get(
  "/fila",
  autenticar,
  validarFilaQuery,
  AgendamentoController.listarFila
);

router.delete(
  "/fila/:id",
  autenticar,
  AgendamentoController.sairDaFila
);

// ── CRUD principal ────────────────────────────────────────────

// Listar agendamentos (visibilidade controlada no Controller pelo perfil)
router.get(
  "/",
  autenticar,
  AgendamentoController.listar
);

// Criar agendamento — qualquer usuário autenticado
router.post(
  "/",
  autenticar,
  validarPayloadAgendamento,
  AgendamentoController.criar
);

// Detalhar um agendamento específico
router.get(
  "/:id",
  autenticar,
  validarId,
  AgendamentoController.buscarPorId
);

// Cancelar — cliente cancela o próprio; admin/func cancela qualquer
// (verificação fina feita dentro do Controller)
router.delete(
  "/:id/cancelar",
  autenticar,
  validarId,
  AgendamentoController.cancelar
);

// Aceitar / recusar reserva — apenas internos (RF7)
router.patch(
  "/:id/status",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  validarId,
  validarStatusReserva,
  AgendamentoController.atualizarStatus
);

module.exports = router;
