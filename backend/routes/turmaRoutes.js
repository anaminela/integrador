
const express = require("express");
const router = express.Router();
const TurmaController = require("../controllers/TurmaController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarCriacaoTurma } = require("../middlewares/validarTurma");
const { validarId } = require("../middlewares/validarQuadra");
const asyncHandler = require('../middlewares/asyncHandler');

router.get(
  "/dashboard",
  autenticar,
  exigirPerfil("FUNCIONARIO", "ADMINISTRADOR"),
  TurmaController.dashboard
);

router.get("/", autenticar, TurmaController.listar);
router.get("/:id", autenticar, validarId, TurmaController.buscarPorId);

router.post(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarCriacaoTurma,
  TurmaController.criar
);

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