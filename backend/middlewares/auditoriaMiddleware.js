// =============================================================
// MIDDLEWARE: auditoriaMiddleware
// Responsabilidade: Interceptar o fim das requisições HTTP e 
// gravar o log de operações no sistema de forma passiva (RF2).
// =============================================================

const LogModel = require("../models/LogModel");

const registrarAuditoria = (req, res, next) => {
  // Escuta o evento 'finish' (quando a resposta HTTP é enviada ao cliente)
  res.on("finish", () => {
    
    // Filtramos apenas métodos que alteram estado (ignora consultas GET)
    // Se quiser registrar tudo, basta remover este if.
    const metodosAuditaveis = ["POST", "PUT", "PATCH", "DELETE"];
    
    if (metodosAuditaveis.includes(req.method)) {
      LogModel.registrar({
        // req.usuario é injetado pelo middleware de autenticação (se logado)
        usuario_id: req.usuario ? req.usuario.id : null,
        acao: req.method,
        recurso: req.originalUrl,
        status_http: res.statusCode,
        ip: req.ip
      });
    }
  });

  // Passa a bola para frente sem travar a requisição
  next();
};

module.exports = { registrarAuditoria };