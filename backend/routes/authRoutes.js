
const express        = require("express");
const router         = express.Router();
const AuthController = require("../controllers/AuthController");
const { autenticar } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

const RecuperacaoSenhaController = require("../controllers/RecuperacaoSenhaController");

router.post("/esqueci-senha", RecuperacaoSenhaController.solicitar);
router.post("/redefinir-senha", RecuperacaoSenhaController.redefinir);


router.post("/login",  AuthController.login);

router.post("/logout", autenticar, AuthController.logout);
router.get("/me",      autenticar, AuthController.me);

module.exports = router;

