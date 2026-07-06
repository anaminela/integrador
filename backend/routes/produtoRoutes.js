// =============================================================
// CAMADA: ROUTES — produtoRoutes
// =============================================================

const express = require("express");
const router = express.Router();
const ProdutoController = require("../controllers/ProdutoController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarCriacaoProduto, validarMovimentacao } = require("../middlewares/validarProduto");
const { validarId } = require("../middlewares/validarQuadra"); // Reaproveitando do sistema base
const asyncHandler = require('../middlewares/asyncHandler');

router.get("/cardapio", autenticar, ProdutoController.cardapio);

// Todos os endpoints de produtos são exclusivos para uso interno
router.use(autenticar, exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"));

// -------------------------------------------------------------------
// Rotas Literais (RF8.2 e RF8.3)
// -------------------------------------------------------------------
router.get("/alertas", ProdutoController.alertas);
router.get("/relatorio", ProdutoController.relatorio);

// -------------------------------------------------------------------
// CRUD e Movimentações (RF8 e RF8.1)
// -------------------------------------------------------------------
router.get("/", ProdutoController.listar);
router.get("/:id", validarId, ProdutoController.buscarPorId);

// Criar produto (apenas admin para evitar funcionários criando itens irreais)
router.post("/", exigirPerfil("ADMINISTRADOR"), validarCriacaoProduto, ProdutoController.criar);

// Lançar compra ou venda no caixa/estoque
router.post("/:id/movimentar", validarId, validarMovimentacao, ProdutoController.movimentarEstoque);

router.put("/:id", validarId, ProdutoController.atualizar);
router.delete("/:id", validarId, ProdutoController.excluir);

module.exports = router;