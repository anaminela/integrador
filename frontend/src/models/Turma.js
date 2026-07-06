export class Turma {
  constructor(dados = {}) {
    this.id = dados.id ?? dados.id_turma ?? null;
    this.quadra_id = dados.quadra_id ?? null;
    this.professor_id = dados.professor_id ?? null;
    this.dia_semana = dados.dia_semana ?? '';
    this.hora_inicio = dados.hora_inicio ?? '';
    this.hora_fim = dados.hora_fim ?? '';
    this.nivel = dados.nivel ?? 'iniciante';
    this.capacidade_maxima = Number(dados.capacidade_maxima ?? 0);

    this.matriculados = Number(dados.matriculados ?? dados.total_matriculados ?? 0);

    this.vagas_disponiveis = Number(
      dados.vagas_disponiveis ?? this.capacidade_maxima - this.matriculados
    );

    this.alunos = dados.alunos ?? [];
    this.fila_espera = dados.fila_espera ?? [];
    this.criado_em = dados.criado_em ?? null;
  }

  get lotada() {
    return this.vagas_disponiveis <= 0;
  }
}