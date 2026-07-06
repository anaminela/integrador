// =============================================================
// MODEL: Quadra
// -------------------------------------------------------------
// Representa uma quadra poliesportiva. Concentra a lógica de
// exibição (status ativo, formatação de preço-hora).
// =============================================================
export class Quadra {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.nome = dados.nome ?? '';
    this.tipo_piso = dados.tipo_piso ?? '';
    this.preco_hora = Number(dados.preco_hora ?? 0);
    this.status = dados.status ?? 'ativa'; // "ativa" | "inativa"
    this.criado_em = dados.criado_em ?? null;
  }

  get ativa() {
    return this.status === 'ativa';
  }
}
