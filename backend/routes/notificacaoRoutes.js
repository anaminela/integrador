const express = require("express");
const router = express.Router();
const NotificacaoController = require("../controllers/NotificacaoController");
const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

router.use(autenticar, exigirPerfil("ADMINISTRADOR"));

router.get("/lembretes", NotificacaoController.enviarLembretes); 
router.get("/alertas", NotificacaoController.alertarInadimplencia);

module.exports = router;