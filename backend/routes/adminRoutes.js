// =============================================================
// CAMADA: ROUTES — adminRoutes
// Responsabilidade: mapear verbos + URLs para AdminController.
//
// NOTA SOBRE ORDEM DAS ROTAS:
// router.patch("/:id/reativar") deve ser declarado ANTES de
// router.patch("/:id") genérico (se existisse), pois o Express
// resolve rotas na ordem de registro. Rotas mais específicas
// sempre vêm antes das genéricas que usam o mesmo padrão.
// =============================================================

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

// -------------------------------------------------------------------
//  Verbo    | Caminho                  | Ação
// ----------|--------------------------|-----------------------------
//  GET      | /admins                  | Lista todos (filtro query)
//  GET      | /admins?tipo_perfil=X    | Lista filtrado por perfil
//  GET      | /admins/:id              | Detalha um
//  POST     | /admins                  | Cria admin ou funcionário
//  PUT      | /admins/:id              | Atualiza dados
//  PATCH    | /admins/:id/reativar     | Reverte soft delete (RF15)
//  DELETE   | /admins/:id              | Soft delete
// -------------------------------------------------------------------

router.get(
  "/",
  autenticar,
  exigirPerfil("ADMINISTRADOR"),
  validarListagemAdmin,
  AdminController.listar
);

// IMPORTANTE: /metricas precisa vir ANTES de /:id, senão o Express
// interpreta "metricas" como valor do parâmetro :id e a rota de
// métricas se torna inalcançável.
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
