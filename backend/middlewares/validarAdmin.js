const AdminModel = require("../models/AdminModel");
const { cpfValido, emailValido } = require("./validarUsuario");

const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarListagemAdmin = (req, res, next) => {
  const { tipo_perfil } = req.query;
  if (tipo_perfil && !AdminModel.TIPOS_PERFIL_VALIDOS.includes(tipo_perfil)) {
    return respostaErro(res, `Filtro inválido. Use: ${AdminModel.TIPOS_PERFIL_VALIDOS.join(" | ")}`);
  }
  next();
};

const validarCriacaoAdmin = (req, res, next) => {
  const { nome, email, cpf_cnpj, telefone, senha, tipo_perfil } = req.body;
  const faltando = [];

  if (!nome) faltando.push("nome");
  if (!email) faltando.push("email");
  if (!cpf_cnpj) faltando.push("cpf");
  if (!telefone) faltando.push("telefone");
  if (!senha) faltando.push("senha");
  if (!tipo_perfil) faltando.push("tipo_perfil");

  if (faltando.length > 0) return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: faltando });

  if (!AdminModel.TIPOS_PERFIL_VALIDOS.includes(tipo_perfil)) {
    return respostaErro(res, `'tipo_perfil' inválido. Use: ${AdminModel.TIPOS_PERFIL_VALIDOS.join(" | ")}`);
  }

  if (!emailValido(email)) return respostaErro(res, "Formato de e-mail inválido.");
  if (!cpfValido(cpf_cnpj)) return respostaErro(res, "Formato de CPF inválido. Use: 000.000.000-00");
  if (senha.length < 6) return respostaErro(res, "A senha deve ter no mínimo 6 caracteres.");

  next();
};

const validarAtualizacaoAdmin = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return respostaErro(res, "O corpo da requisição não pode ser vazio.");

  const { email, cpf, senha, tipo_perfil } = req.body;

  if (tipo_perfil !== undefined && !AdminModel.TIPOS_PERFIL_VALIDOS.includes(tipo_perfil)) {
    return respostaErro(res, `'tipo_perfil' inválido. Use: ${AdminModel.TIPOS_PERFIL_VALIDOS.join(" | ")}`);
  }

  if (email !== undefined && !emailValido(email)) return respostaErro(res, "Formato de e-mail inválido.");
  if (cpf !== undefined && !cpfValido(cpf)) return respostaErro(res, "Formato de CPF inválido. Use: 000.000.000-00");
  if (senha !== undefined && senha.length < 6) return respostaErro(res, "A nova senha deve ter no mínimo 6 caracteres.");

  next();
};

module.exports = { validarListagemAdmin, validarCriacaoAdmin, validarAtualizacaoAdmin };