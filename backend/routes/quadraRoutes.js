// =============================================================
// CAMADA: ROUTES (Roteamento)
// Responsabilidade: MAPEAMENTO — define qual verbo HTTP e qual
// URL aciona qual método do Controller.
// A Rota é a "porta de entrada" da requisição. Ela não processa
// nada: apenas ouve e delega para o Controller certo.
//
// Analogia: se a API fosse um restaurante,
//   - A Rota é o GARÇOM: anota o pedido e leva para a cozinha.
//   - O Controller é o CHEF: decide o que fazer com o pedido.
//   - O Model é a DESPENSA: guarda e fornece os ingredientes.
// =============================================================

const express = require("express");
const router = express.Router();
const {autenticar, exigirPerfil} = require ("../middlewares/autenticar")
const QuadraController = require("../controllers/QuadraController");
const asyncHandler = require('../middlewares/asyncHandler');

// 1. IMPORTANDO OS MIDDLEWARES QUE CRIAMOS
const { 
  validarId, 
  validarCriacaoQuadra, 
  validarAtualizacaoQuadra 
} = require("../middlewares/validarQuadra"); // Router isolado, montado no server.js

// O Router importa o Controller — nunca o Model diretamente.
// As rotas não sabem COMO os dados são processados.

// -------------------------------------------------------------------
// MAPA DE ROTAS — RESTful padrão para o recurso /quadras
//
//  Verbo    | Caminho        | Controller Method  | Ação
// ----------|----------------|--------------------|--------------------
//  GET      | /quadras       | listar             | Lista todas
//  GET      | /quadras/:id   | buscarPorId        | Detalha uma
//  POST     | /quadras       | criar              | Cria nova
//  PUT      | /quadras/:id   | atualizar          | Atualiza dados
//  DELETE   | /quadras/:id   | deletar            | Remove
// -------------------------------------------------------------------

// A requisição chega aqui → é delegada ao Controller → retorna JSON
// 2. INSERINDO OS MIDDLEWARES NO MEIO DAS ROTAS
router.get("/", QuadraController.listar);

// Para buscar, atualizar e deletar, o 'validarId' garante que o ID é um número válido
router.get("/:id", validarId, QuadraController.buscarPorId);

// Na criação, o 'validarCriacaoQuadra' checa se nome, preço, etc., vieram corretos
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
