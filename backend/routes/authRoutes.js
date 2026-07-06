// =============================================================
// CAMADA: ROUTES — authRoutes
// Responsabilidade: mapear os endpoints de autenticação.
//
// ROTAS PÚBLICAS vs PROTEGIDAS:
//   POST /login → pública (não exige token — é aqui que ele nasce)
//   POST /logout → protegida (precisa saber quem está saindo)
//   GET  /me     → protegida (retorna dados de quem está logado)
//
// O middleware autenticar é aplicado individualmente por rota,
// não globalmente — assim /login permanece acessível sem token.
// =============================================================

const express        = require("express");
const router         = express.Router();
const AuthController = require("../controllers/AuthController");
const { autenticar } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

const RecuperacaoSenhaController = require("../controllers/RecuperacaoSenhaController");

// Rotas públicas (o usuário não está logado quando esquece a senha)
router.post("/esqueci-senha", RecuperacaoSenhaController.solicitar);
router.post("/redefinir-senha", RecuperacaoSenhaController.redefinir);

// -------------------------------------------------------------------
//  Verbo  | Caminho        | Middleware   | Ação
// --------|----------------|--------------|---------------------------
//  POST   | /auth/login    | —            | Autentica e emite token
//  POST   | /auth/logout   | autenticar   | Instrui cliente a descartar
//  GET    | /auth/me       | autenticar   | Retorna dados do token
// -------------------------------------------------------------------

// Rota pública — não passa pelo middleware autenticar
router.post("/login",  AuthController.login);

// Rotas protegidas — autenticar valida o token ANTES do Controller
router.post("/logout", autenticar, AuthController.logout);
router.get("/me",      autenticar, AuthController.me);

module.exports = router;

