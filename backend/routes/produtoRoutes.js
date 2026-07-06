const express = require("express");
const router = express.Router();
const ProdutoController = require("../controllers/ProdutoController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const { validarCriacaoProduto, validarMovimentacao } = require("../middlewares/validarProduto");
const { validarId } = require("../middlewares/validarQuadra"); // Reaproveitando do sistema base
const asyncHandler = require('../middlewares/asyncHandler');

router.get("/cardapio", autenticar, ProdutoController.cardapio);

router.use(autenticar, exigirPerfil("ADMINISTRADOR", "FUNCIONARIO"));

router.get("/alertas", ProdutoController.alertas);
router.get("/relatorio", ProdutoController.relatorio);

router.get("/", ProdutoController.listar);
router.get("/:id", validarId, ProdutoController.buscarPorId);

router.post("/", exigirPerfil("ADMINISTRADOR"), validarCriacaoProduto, ProdutoController.criar);

router.post("/:id/movimentar", validarId, validarMovimentacao, ProdutoController.movimentarEstoque);

router.put("/:id", validarId, ProdutoController.atualizar);
router.delete("/:id", validarId, ProdutoController.excluir);

module.exports = router;