// =============================================================
// CAMADA: ROUTES — financeiroRoutes
// Mapeia RF10, RF10.1, RF11 e RF12
// =============================================================

const express = require("express");
const router = express.Router();
const FinanceiroController = require("../controllers/FinanceiroController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarTransacao, validarAtualizacaoStatus } = require("../middlewares/validarFinanceiro");
const { validarId } = require("../middlewares/validarQuadra"); // Reaproveitando validador genérico
const asyncHandler = require('../middlewares/asyncHandler');

// Protege todas as rotas financeiras (apenas staff)
router.use(autenticar, exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"));

// RF12: Relatório consolidado (Restrito apenas para administradores)
router.get(
  "/relatorio",
  exigirPerfil("ADMINISTRADOR"),
  FinanceiroController.relatorio
);

// RF10 e RF10.1: Registrar pagamentos e saídas
router.post(
  "/",
  validarTransacao,
  FinanceiroController.registrar
);

// RF11: Atualizar status do pagamento (ex: de pendente para pago)
router.patch(
  "/:id/status",
  validarId,
  validarAtualizacaoStatus,
  FinanceiroController.atualizarStatus
);

module.exports = router;