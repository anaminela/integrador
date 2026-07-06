// --- Funções Auxiliares Restauradas ---
const cpfValido = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarCriacaoUsuario = (req, res, next) => {
  // Aceita tanto os nomes do frontend (nome, cpf) quanto os do schema.
  const nome_completo = req.body.nome_completo ?? req.body.nome;
  const cpf_cnpj = req.body.cpf_cnpj ?? req.body.cpf;
  const { email, telefone, senha, aceite_termos } = req.body;
  const faltando = [];

  if (!nome_completo) faltando.push("nome");
  if (!email) faltando.push("email");
  if (!cpf_cnpj) faltando.push("cpf");
  if (!telefone) faltando.push("telefone");
  if (!senha) faltando.push("senha");

  if (faltando.length > 0) {
    return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: faltando });
  }

  if (aceite_termos !== true) {
    return respostaErro(res, "É obrigatório aceitar os termos de uso para se cadastrar.");
  }

  if (!emailValido(email)) return respostaErro(res, "Formato de e-mail inválido.");
  if (!cpfValido(cpf_cnpj)) return respostaErro(res, "Formato de CPF inválido. Use: 000.000.000-00");
  if (senha.length < 6) return respostaErro(res, "A senha deve ter no mínimo 6 caracteres.");

  next();
};

const validarAtualizacaoUsuario = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return respostaErro(res, "O corpo da requisição não pode ser vazio.");
  }

  const { email, cpf_cnpj, senha } = req.body;

  if (email !== undefined && !emailValido(email)) return respostaErro(res, "Formato de e-mail inválido.");
  if (cpf_cnpj !== undefined && !cpfValido(cpf_cnpj)) return respostaErro(res, "Formato de CPF inválido. Use: 000.000.000-00");
  if (senha !== undefined && senha.length < 6) return respostaErro(res, "A nova senha deve ter no mínimo 6 caracteres.");

  next();
};

module.exports = { 
  cpfValido, 
  emailValido, 
  validarCriacaoUsuario, 
  validarAtualizacaoUsuario 
};