const express = require("express");
const router  = express.Router();
const AdminController = require("../controllers/AdminController");
const asyncHandler = require('../middlewares/asyncHandler');
const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const {
  validarListagemAdmin,
  validarCriacaoAdmin,
  validarAtualizacaoAdmin
} = require("../middlewares/validarAdmin");
const { validarId } = require("../middlewares/validarQuadra");


router.get(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarListagemAdmin,
  AdminController.listar
);

router.get(
  "/metricas",
  autenticar,
  exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"),
  AdminController.metricas
);

router.get(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  AdminController.buscarPorId
);

router.post(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarCriacaoAdmin,
  AdminController.criar
);

router.put(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  validarAtualizacaoAdmin,
  AdminController.atualizar
);

router.patch(
  "/:id/reativar",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  AdminController.reativar
);

router.delete(
  "/:id",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarId,
  AdminController.desativar
);

module.exports = router;
