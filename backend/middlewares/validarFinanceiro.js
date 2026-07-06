// =============================================================
// MIDDLEWARE: validarFinanceiro
// Responsabilidade: Validar payloads do módulo de pagamentos.
// =============================================================

const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarTransacao = (req, res, next) => {
  const { tipo, valor, categoria, metodo_pagamento, status } = req.body;
  const faltando = [];

  if (!tipo) faltando.push("tipo");
  if (valor === undefined) faltando.push("valor");
  if (!categoria) faltando.push("categoria");

  if (faltando.length > 0) {
    return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: faltando });
  }

  if (!["entrada", "saida"].includes(tipo)) {
    return respostaErro(res, "O 'tipo' deve ser 'entrada' ou 'saida'.");
  }

  if (typeof valor !== "number" || valor <= 0) {
    return respostaErro(res, "O 'valor' deve ser um número positivo.");
  }

  const metodosValidos = ["dinheiro", "PIX", "cartão", null];
  if (metodo_pagamento !== undefined && !metodosValidos.includes(metodo_pagamento)) {
    return respostaErro(res, "Método de pagamento inválido. Use: dinheiro, PIX ou cartão.");
  }

  const statusValidos = ["pago", "pendente", "em aberto"];
  if (status && !statusValidos.includes(status)) {
    return respostaErro(res, "Status inválido. Use: pago, pendente ou em aberto.");
  }

  next();
};

const validarAtualizacaoStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status || !["pago", "pendente", "em aberto"].includes(status)) {
    return respostaErro(res, "Forneça um status válido: pago, pendente ou em aberto.");
  }
  next();
};

module.exports = { validarTransacao, validarAtualizacaoStatus };