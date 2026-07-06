const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UsuarioModel = require("../models/UsuarioModel");

const JWT_SECRET  = process.env.JWT_SECRET  || "quadras_dev_secret_2024";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const AuthController = {
  async login(req, res) {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return resposta(res, 400, { status: "erro", mensagem: "Os campos 'login' e 'senha' são obrigatórios." });
    }

    const usuario = await UsuarioModel.buscarPorEmail(login.trim().toLowerCase());

    if (!usuario) {
      return resposta(res, 401, { status: "erro", mensagem: "Credenciais inválidas." });
    }

    if (usuario.ativo === false) {
      return resposta(res, 403, { status: "erro", mensagem: "Conta desativada. Entre em contato com o administrador." });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return resposta(res, 401, { status: "erro", mensagem: "Credenciais inválidas." });
    }

    const { perfil, tipo_perfil } = UsuarioModel.mapearPerfil(usuario.perfil);

    const payload = {
      id:          usuario.id_usuario,
      nome:        usuario.nome_completo,
      email:       usuario.email,
      perfil,               // "cliente" | "interno" (consumido pelo frontend)
      tipo_perfil,          // "ADMINISTRADOR" | "FUNCIONARIO" | null
      perfil_db:   usuario.perfil, // perfil original do schema
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return resposta(res, 200, {
      status: "sucesso",
      mensagem: "Login realizado com sucesso.",
      token,
      expira_em: JWT_EXPIRES,
      usuario: payload,
    });
  },

  async logout(req, res) {
    return resposta(res, 200, {
      status: "sucesso",
      mensagem: `Até logo, ${req.usuario.nome}. Descarte o token no cliente.`,
    });
  },

  async me(req, res) {
    return resposta(res, 200, { status: "sucesso", usuario: req.usuario });
  },
};

module.exports = AuthController;