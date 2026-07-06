const AgendamentoModel = require("../models/AgendamentoModel");
const QuadraModel = require("../models/QuadraModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

// Cliente é quem não possui tipo_perfil (ADMINISTRADOR/FUNCIONARIO).
const ehCliente = (usuario) => !usuario.tipo_perfil;

const AgendamentoController = {
  async disponibilidade(req, res) {
    const quadra_id = Number(req.query.quadra_id);
    const { data } = req.query;

    const quadra = await QuadraModel.buscarPorId(quadra_id);
    if (!quadra) {
      return resposta(res, 404, { status: "erro", mensagem: `Quadra com id ${quadra_id} não encontrada.` });
    }

    const slots = await AgendamentoModel.gerarSlotsDisponiveis(quadra_id, data);

    return resposta(res, 200, {
      status: "sucesso",
      quadra: { id: quadra.id, nome: quadra.nome },
      data,
      total_slots: slots.length,
      slots_livres: slots.filter((s) => s.disponivel).length,
      slots_ocupados: slots.filter((s) => !s.disponivel).length,
      slots: slots.map((s) => ({ ...s, periodo: `${s.hora_inicio} - ${s.hora_fim}` })),
    });
  },

  async listar(req, res) {
    // Cliente vê apenas os próprios agendamentos; interno vê todos.
    const filtros = { ...req.query };
    if (ehCliente(req.usuario)) filtros.usuario_id = req.usuario.id;

    const agendamentos = await AgendamentoModel.listarTodos(filtros);
    return resposta(res, 200, { status: "sucesso", total: agendamentos.length, data: agendamentos });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const agendamento = await AgendamentoModel.buscarPorId(id);

    if (!agendamento) {
      return resposta(res, 404, { status: "erro", mensagem: `Agendamento ${id} não encontrado.` });
    }

    if (ehCliente(req.usuario) && agendamento.usuario_id !== req.usuario.id) {
      return resposta(res, 403, { status: "erro", mensagem: "Acesso negado. Este agendamento pertence a outro usuário." });
    }

    return resposta(res, 200, { status: "sucesso", data: agendamento });
  },

  async criar(req, res) {
    const { quadra_id, data, hora_inicio, hora_fim, tipo, esporte } = req.body;

    const [quadra, conflito] = await Promise.all([
      QuadraModel.buscarPorId(quadra_id),
      AgendamentoModel.verificarDisponibilidade(quadra_id, data, hora_inicio, hora_fim),
    ]);

    if (!quadra) {
      return resposta(res, 404, { status: "erro", mensagem: `Quadra ${quadra_id} não encontrada.` });
    }

    if (conflito) {
      return resposta(res, 409, {
        status: "erro",
        mensagem: "Conflito de horário. Este período já está reservado.",
        sugestao: "Use a fila de espera.",
      });
    }

    const novoAgendamento = await AgendamentoModel.criar({
      id_cliente: req.usuario.id,
      id_usuario_criador: req.usuario.id,
      id_quadra: quadra_id,
      data,
      hora_inicio,
      hora_fim,
      tipo,
      esporte,
      status: "APROVADO",
    });

    return resposta(res, 201, { status: "sucesso", mensagem: "Agendamento criado com sucesso.", data: novoAgendamento });
  },

  async cancelar(req, res) {
    const id = Number(req.params.id);
    const agendamento = await AgendamentoModel.buscarPorId(id);

    if (!agendamento) {
      return resposta(res, 404, { status: "erro", mensagem: `Agendamento ${id} não encontrado.` });
    }

    if (ehCliente(req.usuario) && agendamento.usuario_id !== req.usuario.id) {
      return resposta(res, 403, { status: "erro", mensagem: "Acesso negado." });
    }

    const cancelado = await AgendamentoModel.atualizarStatus(id, "CANCELADO");
    return resposta(res, 200, { status: "sucesso", mensagem: "Agendamento cancelado.", data: cancelado });
  },

  async entrarNaFila(req, res) {
    const { quadra_id, data, hora_inicio, hora_fim, esporte } = req.body;
    const fila = await AgendamentoModel.entrarNaFila({
      id_cliente: req.usuario.id,
      id_quadra: quadra_id,
      data,
      hora_inicio,
      hora_fim: hora_fim || hora_inicio,
      esporte,
    });
    return resposta(res, 201, {
      status: "sucesso",
      mensagem: `Você entrou na fila de espera (posição ${fila.posicao}).`,
      data: fila,
    });
  },

  async listarFila(req, res) {
    const fila = await AgendamentoModel.listarFila(req.query);
    return resposta(res, 200, { status: "sucesso", total: fila.length, data: fila });
  },

  async sairDaFila(req, res) {
    const id = Number(req.params.id);
    await AgendamentoModel.sairDaFila(id);
    return resposta(res, 200, { status: "sucesso", mensagem: "Você saiu da fila de espera." });
  },

  async atualizarStatus(req, res) {
    const id = Number(req.params.id);
    const { status } = req.body;

    const agendamento = await AgendamentoModel.buscarPorId(id);
    if (!agendamento) {
      return resposta(res, 404, { status: "erro", mensagem: `Agendamento ${id} não encontrado.` });
    }

    const atualizado = await AgendamentoModel.atualizarStatus(id, status);
    return resposta(res, 200, { status: "sucesso", mensagem: `Status atualizado para '${status}'.`, data: atualizado });
  },
};

module.exports = AgendamentoController;
