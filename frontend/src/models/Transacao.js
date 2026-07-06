// =============================================================
// MODEL: Transacao Financeira
// -------------------------------------------------------------
// Representa uma entrada ou saída no caixa (RF10/RF11).
// =============================================================
export class Transacao {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.tipo = dados.tipo ?? 'entrada'; // "entrada" | "saida"
    this.categoria = dados.categoria ?? '';
    this.valor = Number(dados.valor ?? 0);
    this.metodo_pagamento = dados.metodo_pagamento ?? null;
    this.status = dados.status ?? 'em aberto'; // pago | pendente | em aberto
    this.agendamento_id = dados.agendamento_id ?? null;
    this.data = dados.data ?? '';
    this.usuario_id = dados.usuario_id ?? null;
  }

  get entrada() {
    return this.tipo === 'entrada';
  }
}
