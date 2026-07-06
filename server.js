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

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(registrarAuditoria);

app.use(express.static(path.join(__dirname, "frontend", "dist")));

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

app.use("/api", (req, res) => {
  res.status(404).json({
    status: "erro",
    mensagem: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
  });
});

app.get("/*splat", (req, res, next) => {
  const indexHtml = path.join(__dirname, "frontend", "dist", "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`  Servidor rodando em http://localhost:${PORT}`);
  console.log(`  API base:     http://localhost:${PORT}/api/v1`);
  console.log("========================================");
});

module.exports = app;
