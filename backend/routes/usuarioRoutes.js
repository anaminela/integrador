const express = require("express");
const router = express.Router();
const {autenticar, exigirPerfil} = require("../middlewares/autenticar");
const UsuarioController = require("../controllers/UsuarioController");
const asyncHandler = require('../middlewares/asyncHandler');

const { 
  validarCriacaoUsuario, 
  validarAtualizacaoUsuario 
} = require("../middlewares/validarUsuario");

const { validarId } = require("../middlewares/validarQuadra");

router.get(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  UsuarioController.listar
);

router.get(
  "/:id",
  autenticar,
  validarId,
  UsuarioController.buscarPorId
);

router.post(
  "/",
  validarCriacaoUsuario,
  UsuarioController.criar
);

router.put(
  "/:id",
  autenticar,
  validarId,
  validarAtualizacaoUsuario,
  UsuarioController.atualizar
);

router.delete(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  UsuarioController.desativar
);

module.exports = router;

