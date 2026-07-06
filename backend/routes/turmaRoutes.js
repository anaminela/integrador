// =============================================================
// CAMADA: ROUTES — turmaRoutes
// Mapeia os endpoints do Módulo 1 (RF5, RF6, RF18).
// =============================================================

const express = require("express");
const router = express.Router();
const TurmaController = require("../controllers/TurmaController");

// Middlewares
const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarCriacaoTurma } = require("../middlewares/validarTurma");
const { validarId } = require("../middlewares/validarQuadra"); // Reaproveitando validador de ID numérico
const asyncHandler = require('../middlewares/asyncHandler');

// -------------------------------------------------------------------
// RF6: Dashboard do Funcionário (Professor)
// Deve vir antes das rotas /:id para o Express não confundir "dashboard" com um ID
// -------------------------------------------------------------------
router.get(
  "/dashboard",
  autenticar,
  exigirPerfil("FUNCIONARIO", "ADMINISTRADOR"),
  TurmaController.dashboard
);

// -------------------------------------------------------------------
// RF5: Visualizar turmas e planos (Público autenticado)
// -------------------------------------------------------------------
router.get("/", autenticar, TurmaController.listar);
router.get("/:id", autenticar, validarId, TurmaController.buscarPorId);

// -------------------------------------------------------------------
// RF18: Cadastro de turmas (Apenas Administrador)
// -------------------------------------------------------------------
router.post(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarCriacaoTurma,
  TurmaController.criar
);

// -------------------------------------------------------------------
// RF5: Inscrição em turma e Fila de Espera (Clientes)
// -------------------------------------------------------------------
router.post(
  "/:id/inscrever",
  autenticar,
  validarId,
  TurmaController.inscrever
);

router.post(
  "/:id/fila",
  autenticar,
  validarId,
  TurmaController.entrarFila
);

module.exports = router;