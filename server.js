// =============================================================
// PONTO DE ENTRADA DA APLICAÇÃO: server.js
// -------------------------------------------------------------
// Sobe a API Express, registra middlewares globais e monta as
// rotas versionadas em /api/v1. Serve também o build do frontend
// (frontend/dist) quando existir.
// =============================================================
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares transversais ---
const { registrarAuditoria } = require("./backend/middlewares/auditoriaMiddleware");
const errorHandler = require("./backend/middlewares/errorHandler");

// --- Rotas ---
const authRoutes        = require("./backend/routes/authRoutes");
const usuarioRoutes     = require("./backend/routes/usuarioRoutes");
const adminRoutes       = require("./backend/routes/adminRoutes");
const quadraRoutes      = require("./backend/routes/quadraRoutes");
const agendamentoRoutes = require("./backend/routes/agendamentoRoutes");
const turmaRoutes       = require("./backend/routes/turmaRoutes");
const produtoRoutes     = require("./backend/routes/produtoRoutes");
const financeiroRoutes  = require("./backend/routes/financeiroRoutes");
const notificacaoRoutes = require("./backend/routes/notificacaoRoutes");
const auditoriaRoutes   = require("./backend/routes/auditoriaRoutes");

// -------------------------------------------------------------------
// MIDDLEWARES GLOBAIS — a ORDEM importa.
// 1. CORS  2. JSON parser  3. Log  4. Auditoria  5. Estáticos
// O parser de JSON precisa vir ANTES das rotas para popular req.body.
// -------------------------------------------------------------------
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(registrarAuditoria);

// Serve o build de produção do frontend (Vite gera em frontend/dist).
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// -------------------------------------------------------------------
// MONTAGEM DAS ROTAS (API versionada)
// -------------------------------------------------------------------
app.use("/api/v1/auth",         authRoutes);
app.use("/api/v1/usuarios",     usuarioRoutes);
app.use("/api/v1/admins",       adminRoutes);
app.use("/api/v1/quadras",      quadraRoutes);
app.use("/api/v1/agendamentos", agendamentoRoutes);
app.use("/api/v1/turmas",       turmaRoutes);
app.use("/api/v1/produtos",     produtoRoutes);
app.use("/api/v1/financeiro",   financeiroRoutes);
app.use("/api/v1/notificacoes", notificacaoRoutes);
app.use("/api/v1/auditoria",    auditoriaRoutes);

// -------------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------------
app.get("/api/v1", (_req, res) => {
  res.json({
    status: "online",
    mensagem: "API de Gerenciamento de Arena Esportiva (G2 Arena)",
    versao: "1.0.0",
    endpoints_disponiveis: {
      auth:          "/api/v1/auth",
      quadras:       "/api/v1/quadras",
      usuarios:      "/api/v1/usuarios",
      admins:        "/api/v1/admins",
      agendamentos:  "/api/v1/agendamentos",
      turmas:        "/api/v1/turmas",
      produtos:      "/api/v1/produtos",
      financeiro:    "/api/v1/financeiro",
      notificacoes:  "/api/v1/notificacoes",
      auditoria:     "/api/v1/auditoria",
    },
  });
});

// -------------------------------------------------------------------
// 404 GLOBAL — captura qualquer rota /api não mapeada.
// -------------------------------------------------------------------
app.use("/api", (req, res) => {
  res.status(404).json({
    status: "erro",
    mensagem: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// Fallback SPA: qualquer outra rota devolve o index.html do frontend
// (permite deep-links do React Router quando servido pelo Express).
// Obs.: no Express 5 os curingas precisam ser nomeados ("/*splat"),
// pois o novo path-to-regexp não aceita mais o "*" solto.
app.get("/*splat", (req, res, next) => {
  const indexHtml = path.join(__dirname, "frontend", "dist", "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// -------------------------------------------------------------------
// HANDLER DE ERROS — deve ser o ÚLTIMO middleware registrado.
// -------------------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------------------
// INICIALIZAÇÃO (uma única chamada a app.listen)
// -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log("========================================");
  console.log(`  Servidor rodando em http://localhost:${PORT}`);
  console.log(`  API base:     http://localhost:${PORT}/api/v1`);
  console.log("========================================");
});

module.exports = app;
