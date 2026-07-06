const TurmaModel = require("../models/TurmaModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const TurmaController = {
  async listar(req, res) {
    const turmas = await TurmaModel.listarTodas();
    return resposta(res, 200, { status: "sucesso", total: turmas.length, data: turmas });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const turma = await TurmaModel.buscarPorId(id);

    if (!turma) {
      return resposta(res, 404, { status: "erro", mensagem: `Turma ${id} não encontrada.` });
    }

    return resposta(res, 200, { status: "sucesso", data: turma });
  },

  async criar(req, res) {
    const novaTurma = await TurmaModel.criar(req.body);
    return resposta(res, 201, { status: "sucesso", mensagem: "Turma criada com sucesso.", data: novaTurma });
  },

  async inscrever(req, res) {
    const turma_id = Number(req.params.id);
    const usuario_id = req.usuario.id;

    const turma = await TurmaModel.buscarPorId(turma_id);
    if (!turma) return resposta(res, 404, { status: "erro", mensagem: "Turma não encontrada." });

    await TurmaModel.matricularAluno(turma_id, usuario_id);

    return resposta(res, 201, { status: "sucesso", mensagem: `Inscrição realizada!` });
  },
  
  async entrarFila(req, res) {
    const turma_id = Number(req.params.id);
    const usuario_id = req.usuario.id;
    // const resultado = await TurmaModel.entrarFila(turma_id, usuario_id);
    return resposta(res, 201, { status: "sucesso", mensagem: "Você entrou na fila de espera da turma." });
  },

  async dashboard(req, res) {
    const professor_id = req.usuario.id;
    // Buscar turmas específicas desse professor
    // const agenda = await TurmaModel.listarPorProfessor(professor_id);
    return resposta(res, 200, { status: "sucesso", mensagem: "Agenda e turmas do professor.", data: [] });
  }
};

module.exports = TurmaController;