
const express = require("express");
const router = express.Router();
const FinanceiroController = require("../controllers/FinanceiroController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarTransacao, validarAtualizacaoStatus } = require("../middlewares/validarFinanceiro");
const { validarId } = require("../middlewares/validarQuadra");
const asyncHandler = require('../middlewares/asyncHandler');

router.use(autenticar, exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"));

router.get(
  "/relatorio",
  exigirPerfil("ADMINISTRADOR"),
  FinanceiroController.relatorio
);

router.post(
  "/",
  validarTransacao,
  FinanceiroController.registrar
);

router.patch(
  "/:id/status",
  validarId,
  validarAtualizacaoStatus,
  FinanceiroController.atualizarStatus
);

module.exports = router;