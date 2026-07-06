const LogModel = require("../models/LogModel");
const UsuarioModel = require("../models/UsuarioModel");
const AgendamentoModel = require("../models/AgendamentoModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const AuditoriaController = {
  async listarLogs(req, res) {
    const historico = await LogModel.listarTodos();
    return resposta(res, 200, { status: "sucesso", total_exibido: historico.length, data: historico });
  },

  async dashboardMetricas(req, res) {
    const [todosUsuarios, todosAgendamentos] = await Promise.all([
      UsuarioModel.listarTodos(),
      AgendamentoModel.listarTodos()
    ]);

    const mediaAtividades = todosUsuarios.length > 0 
      ? (todosAgendamentos.length / todosUsuarios.length).toFixed(2) 
      : 0;

    return resposta(res, 200, {
      status: "sucesso",
      metricas: {
        total_usuarios_cadastrados: todosUsuarios.length,
        total_agendamentos: todosAgendamentos.length,
        media_agendamentos_por_usuario: Number(mediaAtividades)
      }
    });
  }
};

module.exports = AuditoriaController;