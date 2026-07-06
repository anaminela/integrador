const FinanceiroModel = require("../models/FinanceiroModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const FinanceiroController = {
  async registrar(req, res) {
    const dados = { ...req.body, id_usuario: req.usuario.id };
    const resultado = await FinanceiroModel.criar(dados);

    return resposta(res, 201, { status: "sucesso", mensagem: "Transação registrada com sucesso.", data: resultado });
  },

  async atualizarStatus(req, res) {
    const id = Number(req.params.id);
    const { status } = req.body;

    const atualizado = await FinanceiroModel.atualizarStatus(id, status);

    if (!atualizado) {
      return resposta(res, 404, { status: "erro", mensagem: `Transação ${id} não encontrada.` });
    }

    return resposta(res, 200, { status: "sucesso", mensagem: `Status atualizado para '${status}'.`, data: atualizado });
  },

  async relatorio(req, res) {
    const relatorio = await FinanceiroModel.listarTodos();
    return resposta(res, 200, { status: "sucesso", data: relatorio });
  }
};

module.exports = FinanceiroController;