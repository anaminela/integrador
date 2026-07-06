
export class Quadra {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.nome = dados.nome ?? '';
    this.tipo_piso = dados.tipo_piso ?? '';
    this.preco_hora = Number(dados.preco_hora ?? 0);
    this.status = dados.status ?? 'ativa';
    this.criado_em = dados.criado_em ?? null;
  }

  get ativa() {
    return this.status === 'ativa';
  }
}
