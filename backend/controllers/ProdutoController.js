const ProdutoModel = require("../models/ProdutoModel");

const resposta = (res, httpStatus, payload) => res.status(httpStatus).json(payload);

const ProdutoController = {
  async listar(req, res) {
    const produtos = await ProdutoModel.listarTodos();
    return resposta(res, 200, { status: "sucesso", total: produtos.length, data: produtos });
  },

  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const produto = await ProdutoModel.buscarPorId(id);

    if (!produto) return resposta(res, 404, { status: "erro", mensagem: `Produto ${id} não encontrado.` });

    return resposta(res, 200, { status: "sucesso", data: produto });
  },

  async criar(req, res) {
    const novoProduto = await ProdutoModel.criar(req.body);
    return resposta(res, 201, { status: "sucesso", mensagem: "Produto cadastrado.", data: novoProduto });
  },

  async cardapio(req, res) {
    const produtos = await ProdutoModel.listarTodos();
    // Cardápio: apenas produtos com estoque positivo (RF3).
    const disponiveis = produtos.filter((p) => p.quantidade > 0);
    return resposta(res, 200, { status: "sucesso", total: disponiveis.length, data: disponiveis });
  },

  async alertas(req, res) {
    const produtos = await ProdutoModel.listarTodos();
    // Alerta quando o estoque está no/abaixo do mínimo (RF8.2).
    const produtosAlerta = produtos.filter((p) => p.quantidade <= p.estoque_minimo);
    return resposta(res, 200, { status: "sucesso", total_alertas: produtosAlerta.length, data: produtosAlerta });
  },

  async relatorio(req, res) {
    const { data_inicio, data_fim } = req.query;
    const movimentacoes = await ProdutoModel.relatorioMovimentacoes(data_inicio, data_fim);
    return resposta(res, 200, { status: "sucesso", data: { movimentacoes } });
  },

  async atualizar(req, res) {
    const id = Number(req.params.id);
    const produtoAtualizado = await ProdutoModel.atualizar(id, req.body);
    if (!produtoAtualizado) {
      return resposta(res, 404, { status: "erro", mensagem: `Produto ${id} não encontrado.` });
    }
    return resposta(res, 200, { status: "sucesso", mensagem: "Produto atualizado com sucesso.", data: produtoAtualizado });
  },

  async movimentarEstoque(req, res) {
    const produto_id = Number(req.params.id);
    const { tipo, quantidade, valor_unitario } = req.body;

    const produto = await ProdutoModel.buscarPorId(produto_id);
    if (!produto) return resposta(res, 404, { status: "erro", mensagem: "Produto não encontrado." });

    const ehEntrada = String(tipo).toLowerCase() === "entrada";
    const novaQuantidade = ehEntrada ? produto.quantidade + quantidade : produto.quantidade - quantidade;

    if (novaQuantidade < 0) {
      return resposta(res, 400, { status: "erro", mensagem: "Estoque insuficiente para esta saída." });
    }

    const produtoAtualizado = await ProdutoModel.atualizarEstoque(produto_id, novaQuantidade);

    await ProdutoModel.registrarMovimento({
      id_produto: produto_id,
      tipo: ehEntrada ? "ENTRADA" : "SAIDA",
      quantidade,
      origem: ehEntrada ? "compra/reposicao" : `venda (unit: ${valor_unitario ?? produto.preco_venda})`,
    });

    return resposta(res, 200, {
      status: "sucesso",
      mensagem: "Movimentação registrada com sucesso.",
      produto: produtoAtualizado,
    });
  },

  async excluir(req, res) {
    const id = Number(req.params.id);
    await ProdutoModel.remover(id);
    return resposta(res, 200, { status: "sucesso", mensagem: "Produto removido com sucesso." });
  },
};

module.exports = ProdutoController;
