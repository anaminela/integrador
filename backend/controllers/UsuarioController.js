const bcrypt = require("bcrypt");
const UsuarioModel = require("../models/UsuarioModel");

const BCRYPT_ROUNDS = 12;
const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const UsuarioController = {
  async listar(req, res) {
    const usuarios = await UsuarioModel.listarTodos();
    return resposta(res, 200, { status: "sucesso", total: usuarios.length, data: usuarios });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);

    // Cliente (sem tipo_perfil) só pode consultar o próprio cadastro.
    if (!req.usuario.tipo_perfil && req.usuario.id !== id) {
      return resposta(res, 403, { status: "erro", mensagem: "Acesso negado." });
    }

    const usuario = await UsuarioModel.buscarPorId(id);
    if (!usuario) {
      return resposta(res, 404, { status: "erro", mensagem: `Usuário com id ${id} não encontrado.` });
    }

    return resposta(res, 200, { status: "sucesso", data: usuario });
  },

  async criar(req, res) {
    // Aceita tanto o vocabulário do frontend (nome, cpf) quanto o do schema.
    const nome_completo = req.body.nome_completo ?? req.body.nome;
    const cpf_cnpj = req.body.cpf_cnpj ?? req.body.cpf;
    const { email, telefone, senha, perfil, aceite_termos } = req.body;

    const existente = await UsuarioModel.buscarPorEmail(email.toLowerCase());
    if (existente) {
      return resposta(res, 409, { status: "erro", mensagem: "Já existe um usuário cadastrado com este e-mail." });
    }

    const senha_hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

    const novoUsuario = await UsuarioModel.criar({
      nome_completo,
      email: email.toLowerCase(),
      cpf_cnpj,
      telefone,
      senha_hash,
      perfil: perfil || 'CLIENTE',
      aceite_termos: aceite_termos ?? true,
    });

    return resposta(res, 201, { status: "sucesso", mensagem: "Usuário cadastrado com sucesso.", data: novoUsuario });
  },

  async atualizar(req, res) {
    const id = Number(req.params.id);
    const dadosAtualizar = req.body;

    if (!req.usuario.tipo_perfil && req.usuario.id !== id) {
      return resposta(res, 403, { status: "erro", mensagem: "Acesso negado." });
    }

    if (dadosAtualizar.senha) {
      dadosAtualizar.senha_hash = await bcrypt.hash(dadosAtualizar.senha, BCRYPT_ROUNDS);
      delete dadosAtualizar.senha;
    }

    const usuarioAtualizado = await UsuarioModel.atualizar(id, dadosAtualizar);
    if (!usuarioAtualizado) {
      return resposta(res, 404, { status: "erro", mensagem: `Usuário com id ${id} não encontrado.` });
    }

    return resposta(res, 200, { status: "sucesso", mensagem: "Usuário atualizado com sucesso.", data: usuarioAtualizado });
  },

  async desativar(req, res) {
    const id = Number(req.params.id);
    await UsuarioModel.remover(id);
    return resposta(res, 200, { status: "sucesso", mensagem: `Usuário com id ${id} desativado com sucesso. O registro foi preservado.` });
  }
};

module.exports = UsuarioController;