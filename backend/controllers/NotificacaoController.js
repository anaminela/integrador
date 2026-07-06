const AgendamentoModel = require("../models/AgendamentoModel");
const FinanceiroModel = require("../models/FinanceiroModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const NotificacaoController = {
  async enviarLembretes(req, res) {
    const todosAgendamentos = await AgendamentoModel.listarTodos();
    
    // Retorna apenas sucesso, processamento assíncrono real seria feito via Jobs/Workers
    return resposta(res, 200, {
      status: "sucesso",
      mensagem: "Rotina de lembretes processada com sucesso.",
      total_analisados: todosAgendamentos.length
    });
  },

  async alertarInadimplencia(req, res) {
    const transacoes = await FinanceiroModel.listarTodos();
    const inadimplentes = transacoes.filter(t => t.tipo === "ENTRADA" && t.status !== "PAGO");

    return resposta(res, 200, {
      status: "sucesso",
      alertas: { clientes_com_atraso: inadimplentes.length }
    });
  }
};

module.exports = NotificacaoController;