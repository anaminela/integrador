export class Produto {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.nome = dados.nome ?? '';
    this.descricao = dados.descricao ?? '';
    this.categoria = dados.categoria ?? '';
    this.quantidade = Number(dados.quantidade ?? 0);
    this.estoque_minimo = Number(dados.estoque_minimo ?? 0);
    this.preco_custo = Number(dados.preco_custo ?? 0);
    this.preco_venda = Number(dados.preco_venda ?? 0);
    this.ativo = dados.ativo ?? true;
    this.criado_em = dados.criado_em ?? null;
  }

  get estoqueBaixo() {
    return this.quantidade <= this.estoque_minimo;
  }

  get margem() {
    return this.preco_venda - this.preco_custo;
  }
}
