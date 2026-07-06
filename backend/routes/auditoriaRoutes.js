// =============================================================
// CAMADA: ROUTES — auditoriaRoutes
// Responsabilidade: Mapear RF16 (Logs e Métricas).
// =============================================================

const express = require("express");
const router = express.Router();
const AuditoriaController = require("../controllers/AuditoriaController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

// Trava TODAS as rotas deste arquivo apenas para Administradores
router.use(autenticar, exigirPerfil("ADMINISTRADOR"));

// RF16: Rota para ler o Log de Operações
router.get("/logs", AuditoriaController.listarLogs);

// RF16: Rota para ler o Dashboard de Métricas
router.get("/dashboard", AuditoriaController.dashboardMetricas);

module.exports = router;