
const express = require("express");
const router = express.Router();
const AuditoriaController = require("../controllers/AuditoriaController");

const { autenticar, exigirPerfil } = require("../middlewares/autenticar");
const asyncHandler = require('../middlewares/asyncHandler');

router.use(autenticar, exigirPerfil("ADMINISTRADOR"));

router.get("/logs", AuditoriaController.listarLogs);

router.get("/dashboard", AuditoriaController.dashboardMetricas);

module.exports = router;