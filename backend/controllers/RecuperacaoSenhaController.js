const bcrypt = require("bcrypt");
const UsuarioModel = require("../models/UsuarioModel");

// Mock em memória para tokens, idealmente isso iria para uma tabela `recuperacao_senha` no banco
const tokensRecuperacao = []; 

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const RecuperacaoSenhaController = {
  async solicitar(req, res) {
    const { email } = req.body;
    if (!email) return resposta(res, 400, { status: "erro", mensagem: "Informe o e-mail." });

    const usuario = await UsuarioModel.buscarPorEmail(email.toLowerCase());
    
    if (usuario) {
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      tokensRecuperacao.push({ email: email.toLowerCase(), token, expira_em: Date.now() + 15 * 60000 });
      console.log(`[E-MAIL ENVIADO] Para: ${email} | Token: ${token}`);
    }

    return resposta(res, 200, { status: "sucesso", mensagem: "Se o e-mail constar em nossa base, um link de recuperação foi enviado." });
  },

  async redefinir(req, res) {
    const { email, token, nova_senha } = req.body;

    if (!email || !token || !nova_senha) {
      return resposta(res, 400, { status: "erro", mensagem: "E-mail, token e nova senha são obrigatórios." });
    }

    const registroValido = tokensRecuperacao.find(t => t.email === email.toLowerCase() && t.token === token && t.expira_em > Date.now());

    if (!registroValido) {
      return resposta(res, 400, { status: "erro", mensagem: "Token inválido ou expirado. Solicite novamente." });
    }

    const usuario = await UsuarioModel.buscarPorEmail(email.toLowerCase());
    const senhaHash = await bcrypt.hash(nova_senha, 12);
    
    await UsuarioModel.atualizar(usuario.id_usuario, { senha_hash: senhaHash });

    const index = tokensRecuperacao.indexOf(registroValido);
    tokensRecuperacao.splice(index, 1);

    return resposta(res, 200, { status: "sucesso", mensagem: "Senha redefinida com sucesso. Faça login." });
  }
};

module.exports = RecuperacaoSenhaController;