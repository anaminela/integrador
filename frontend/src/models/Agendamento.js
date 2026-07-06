// =============================================================
// MODEL: Agendamento
// -------------------------------------------------------------
// Representa uma reserva de quadra. Inclui lógica derivada de
// status (confirmado/pendente/cancelado) e horário nobre (RF4).
// =============================================================
export class Agendamento {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.quadra_id = dados.quadra_id ?? null;
    this.usuario_id = dados.usuario_id ?? null;
    this.data = dados.data ?? '';
    this.hora_inicio = dados.hora_inicio ?? '';
    this.hora_fim = dados.hora_fim ?? '';
    this.tipo = dados.tipo ?? 'avulso'; // "avulso" | "mensal"
    this.esporte = dados.esporte ?? '';
    this.preco = Number(dados.preco ?? 0);
    this.horario_nobre = Boolean(dados.horario_nobre);
    this.status = dados.status ?? 'pendente';
    this.criado_em = dados.criado_em ?? null;
  }

  get periodo() {
    return `${this.hora_inicio} - ${this.hora_fim}`;
  }

  get confirmado() {
    return this.status === 'confirmado';
  }

  get cancelado() {
    return this.status === 'cancelado';
  }

  get pendente() {
    return this.status === 'pendente';
  }
}
