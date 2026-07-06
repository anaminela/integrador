const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro(res, "O parâmetro :id deve ser um número inteiro positivo.");
  }
  next();
};

const validarCriacaoQuadra = (req, res, next) => {
  const { nome, tipo_piso, preco_hora, status } = req.body;
  const camposFaltando = [];
  const precoHoraNumero = Number(preco_hora);

  if (!nome) camposFaltando.push("nome");
  if (!tipo_piso) camposFaltando.push("tipo_piso");
  if (preco_hora === undefined || preco_hora === null) camposFaltando.push("preco_hora");

  if (camposFaltando.length > 0) {
    return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: camposFaltando });
  }

  if (Number.isNaN(precoHoraNumero) || precoHoraNumero <= 0) {
    return respostaErro(res, "O campo 'preco_hora' deve ser um número positivo.");
  }

  if (status && !["ativa", "inativa"].includes(status)) {
    return respostaErro(res, "O campo 'status' deve ser 'ativa' ou 'inativa'.");
  }

  next();
};

const validarAtualizacaoQuadra = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return respostaErro(res, "O corpo da requisição não pode ser vazio.");
  }

  const { preco_hora, status } = req.body;

  if (preco_hora !== undefined && (typeof preco_hora !== "number" || preco_hora <= 0)) {
    return respostaErro(res, "O campo 'preco_hora' deve ser um número positivo.");
  }

  if (status && !["ativa", "inativa"].includes(status)) {
    return respostaErro(res, "O campo 'status' deve ser 'ativa' ou 'inativa'.");
  }

  next();
};

module.exports = { validarId, validarCriacaoQuadra, validarAtualizacaoQuadra };