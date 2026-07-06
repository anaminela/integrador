const QuadraModel = require("../models/QuadraModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const QuadraController = {
  async listar(req, res) {
    const quadras = await QuadraModel.listarTodos();
    return resposta(res, 200, { status: "sucesso", total: quadras.length, data: quadras });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const quadra = await QuadraModel.buscarPorId(id);

    if (!quadra) {
      return resposta(res, 404, { status: "erro", mensagem: `Quadra com id ${id} não encontrada.` });
    }

    return resposta(res, 200, { status: "sucesso", data: quadra });
  },

  async criar(req, res) {
    const novaQuadra = await QuadraModel.criar(req.body);
    return resposta(res, 201, { status: "sucesso", mensagem: "Quadra criada com sucesso.", data: novaQuadra });
  },

  async atualizar(req, res) {
    const id = Number(req.params.id);
    const quadraAtualizada = await QuadraModel.atualizar(id, req.body);

    if (!quadraAtualizada) {
      return resposta(res, 404, { status: "erro", mensagem: `Quadra com id ${id} não encontrada.` });
    }

    return resposta(res, 200, { status: "sucesso", mensagem: "Quadra atualizada com sucesso.", data: quadraAtualizada });
  },

  // AQUI ESTÁ O MÉTODO QUE FALTAVA!
  async deletar(req, res) {
    const id = Number(req.params.id);
    
    // Note que se no seu QuadraModel a função se chamar 'remover', troque 'delete' por 'remover'
    await QuadraModel.remover(id); 

    return resposta(res, 200, { status: "sucesso", mensagem: `Quadra com id ${id} removida com sucesso.` });
  }
};

module.exports = QuadraController;