const express = require("express");
const router = express.Router();
const {autenticar, exigirPerfil} = require ("../middlewares/autenticar")
const QuadraController = require("../controllers/QuadraController");
const asyncHandler = require('../middlewares/asyncHandler');

const { 
  validarId, 
  validarCriacaoQuadra, 
  validarAtualizacaoQuadra 
} = require("../middlewares/validarQuadra");

router.get("/", QuadraController.listar);

router.get("/:id", validarId, QuadraController.buscarPorId);

router.post(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  validarCriacaoQuadra,
  QuadraController.criar
);

router.put(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  validarId,
  validarAtualizacaoQuadra,
  QuadraController.atualizar
);

router.delete(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  QuadraController.deletar
);

module.exports = router;
