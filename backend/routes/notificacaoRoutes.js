const express = require("express");
const router = express.Router();
const NotificacaoController = require("../controllers/NotificacaoController");
const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

// Apenas administradores podem disparar/consultar essas automações
router.use(autenticar, exigirPerfil("ADMINISTRADOR"));

router.get("/lembretes", NotificacaoController.enviarLembretes); // RF13
router.get("/alertas", NotificacaoController.alertarInadimplencia); // RF14

module.exports = router;