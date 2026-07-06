// =============================================================
// MIDDLEWARE: validarProduto
// =============================================================

const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarCriacaoProduto = (req, res, next) => {
  const { nome, quantidade, estoque_minimo, preco_custo, preco_venda, categoria } = req.body;
  const faltando = [];

  if (!nome) faltando.push("nome");
  if (estoque_minimo === undefined) faltando.push("estoque_minimo");
  if (preco_custo === undefined) faltando.push("preco_custo");
  if (preco_venda === undefined) faltando.push("preco_venda");
  if (categoria === undefined) faltando.push("categoria");

  if (faltando.length > 0) return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: faltando });

  if (Number(estoque_minimo) < 0 || Number(preco_custo) < 0 || Number(preco_venda) < 0) {
    return respostaErro(res, "Valores de estoque e preços não podem ser negativos.");
  }
  req.body.quantidade = quantidade !== undefined ? Number(quantidade) : 0;
  req.body.estoque_minimo = Number(estoque_minimo);
  req.body.preco_custo = Number(preco_custo);
  req.body.preco_venda = Number(preco_venda);
  next();
};

const validarMovimentacao = (req, res, next) => {
  const { tipo, quantidade } = req.body;
  const quantidadeNumero = Number(quantidade);

  if (!["entrada", "saida"].includes(String(tipo).toLowerCase())) {
    return respostaErro(res, "O campo 'tipo' deve ser 'entrada' ou 'saida'.");
  }

  if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
    return respostaErro(res, "A 'quantidade' movimentada deve ser um número inteiro maior que zero.");
  }

  req.body.quantidade = quantidadeNumero;
  next();
};

module.exports = { validarCriacaoProduto, validarMovimentacao };