const bcrypt = require("bcrypt");
const UsuarioModel = require("../models/UsuarioModel");

const BCRYPT_ROUNDS = 12;
const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

// Converte o tipo_perfil enviado pelo frontend/validador ("ADMINISTRADOR" |
// "FUNCIONARIO") no valor de coluna aceito pelo schema (enum perfil).
function tipoParaPerfilDb(tipo_perfil) {
  if (tipo_perfil === "ADMINISTRADOR") return "ADMINISTRADOR";
  if (tipo_perfil === "FUNCIONARIO") return "FUNCIONARIO";
  if (tipo_perfil === "PROFESSOR") return "PROFESSOR";
  return "FUNCIONARIO";
}

const AdminController = {
  async listar(req, res) {
    // Lista todos os usuários internos (não-clientes). O campo perfil_db
    // preserva o valor bruto do enum do banco para o filtro.
    const usuarios = await UsuarioModel.listarTodos();
    let filtrados = usuarios.filter((u) => u.perfil_db !== "CLIENTE");

    // Filtro opcional por tipo_perfil (?tipo_perfil=ADMINISTRADOR|FUNCIONARIO)
    const { tipo_perfil } = req.query;
    if (tipo_perfil) {
      filtrados = filtrados.filter((u) => u.tipo_perfil === tipo_perfil);
    }

    return resposta(res, 200, { status: "sucesso", total: filtrados.length, data: filtrados });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const admin = await UsuarioModel.buscarPorId(id);

    if (!admin || admin.perfil_db === "CLIENTE") {
      return resposta(res, 404, { status: "erro", mensagem: `Funcionário/Administrador com id ${id} não encontrado.` });
    }

    return resposta(res, 200, { status: "sucesso", data: admin });
  },

  async criar(req, res) {
    // O validador garante: nome, email, cpf_cnpj, telefone, senha, tipo_perfil
    const { nome, nome_completo, email, cpf_cnpj, telefone, senha, tipo_perfil } = req.body;

    const emailExistente = await UsuarioModel.buscarPorEmail(email.toLowerCase());
    if (emailExistente) {
      return resposta(res, 409, { status: "erro", mensagem: "Já existe um usuário cadastrado com este e-mail." });
    }

    const senha_hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

    const novoAdmin = await UsuarioModel.criar({
      nome_completo: nome_completo || nome,
      email: email.toLowerCase(),
      cpf_cnpj,
      telefone,
      senha_hash,
      perfil: tipoParaPerfilDb(tipo_perfil),
    });

    return resposta(res, 201, { status: "sucesso", mensagem: "Usuário interno criado com sucesso.", data: novoAdmin });
  },

  async atualizar(req, res) {
    const id = Number(req.params.id);
    const dadosParaAtualizar = { ...req.body };

    if (dadosParaAtualizar.senha) {
      dadosParaAtualizar.senha_hash = await bcrypt.hash(dadosParaAtualizar.senha, BCRYPT_ROUNDS);
      delete dadosParaAtualizar.senha;
    }

    // Traduz tipo_perfil (frontend) para a coluna perfil (schema).
    if (dadosParaAtualizar.tipo_perfil) {
      dadosParaAtualizar.perfil = tipoParaPerfilDb(dadosParaAtualizar.tipo_perfil);
      delete dadosParaAtualizar.tipo_perfil;
    }

    const adminAtualizado = await UsuarioModel.atualizar(id, dadosParaAtualizar);
    if (!adminAtualizado) {
      return resposta(res, 404, { status: "erro", mensagem: `Usuário interno com id ${id} não encontrado.` });
    }

    return resposta(res, 200, { status: "sucesso", mensagem: "Usuário interno atualizado com sucesso.", data: adminAtualizado });
  },

  async desativar(req, res) {
    const id = Number(req.params.id);
    await UsuarioModel.remover(id);
    return resposta(res, 200, { status: "sucesso", mensagem: `Usuário interno com id ${id} desativado. Registro preservado.` });
  },

  async reativar(req, res) {
    const id = Number(req.params.id);
    const reativado = await UsuarioModel.atualizar(id, { ativo: true });

    if (!reativado) {
      return resposta(res, 404, { status: "erro", mensagem: `Usuário interno com id ${id} não encontrado.` });
    }

    return resposta(res, 200, { status: "sucesso", mensagem: `Usuário interno com id ${id} reativado com sucesso.` });
  },

  async metricas(req, res) {
    return resposta(res, 200, {
      status: "sucesso",
      data: { agendamentosHoje: 0, receitaDia: 0, pagamentosPendentes: 0, alertasEstoque: 0 },
    });
  },
};

module.exports = AdminController;
