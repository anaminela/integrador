// =============================================================
// CAMADA: ROUTES — usuarioRoutes
// Responsabilidade: mapear verbos HTTP + URLs para os métodos
// do UsuarioController. Nenhuma lógica aqui — só delegação.
//
// DECISÃO DE DESIGN — DELETE como soft delete:
// O verbo DELETE continua sendo usado (semântica REST correta),
// mas o efeito é a desativação, não a remoção física.
// Isso é transparente para o cliente da API.
// =============================================================

const express = require("express");
const router = express.Router();
const {autenticar, exigirPerfil} = require("../middlewares/autenticar");
const UsuarioController = require("../controllers/UsuarioController");
const asyncHandler = require('../middlewares/asyncHandler');

// 1. IMPORTANDO OS MIDDLEWARES DE USUÁRIO
const { 
  validarCriacaoUsuario, 
  validarAtualizacaoUsuario 
} = require("../middlewares/validarUsuario");

// Importando o validador genérico de ID (reaproveitando código!)
const { validarId } = require("../middlewares/validarQuadra");

// 2. INSERINDO NAS ROTAS
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

// -------------------------------------------------------------------
//  Verbo    | Caminho          | Controller Method  | Ação
// ----------|------------------|--------------------|-------------------
//  GET      | /usuarios        | listar             | Lista todos
//  GET      | /usuarios/:id    | buscarPorId        | Detalha um
//  POST     | /usuarios        | criar              | Cadastra (+ hash)
//  PUT      | /usuarios/:id    | atualizar          | Atualiza dados
//  DELETE   | /usuarios/:id    | desativar          | Soft delete
// -------------------------------------------------------------------
