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

router.get(
  "/disponibilidade",
  autenticar,
  validarDisponibilidade,
  AgendamentoController.disponibilidade
);

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

router.get(
  "/",
  autenticar,
  AgendamentoController.listar
);

router.post(
  "/",
  autenticar,
  validarPayloadAgendamento,
  AgendamentoController.criar
);

router.get(
  "/:id",
  autenticar,
  validarId,
  AgendamentoController.buscarPorId
);

router.delete(
  "/:id/cancelar",
  autenticar,
  validarId,
  AgendamentoController.cancelar
);

router.patch(
  "/:id/status",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  validarId,
  validarStatusReserva,
  AgendamentoController.atualizarStatus
);

module.exports = router;
