const db = require("../config/db");

let schemaCache = null;

function criarErro(mensagem, statusCode = 500, codigo = "ERRO_INTERNO") {
  const err = new Error(mensagem);
  err.statusCode = statusCode;
  err.codigo = codigo;
  return err;
}

async function carregarSchema() {
  if (schemaCache) return schemaCache;

  const colunasTurma = await db.any(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'turma'
    `
  );

  const colunasTurmaSet = new Set(colunasTurma.map((c) => c.column_name));

  const existeTurmaAluno = await db.one(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = 'turma_aluno'
    ) AS existe
    `
  );

  const colunasTurmaAluno = existeTurmaAluno.existe
    ? await db.any(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'turma_aluno'
        `
      )
    : [];

  const colunasTurmaAlunoSet = new Set(colunasTurmaAluno.map((c) => c.column_name));

  schemaCache = {
    turma: colunasTurmaSet,
    turmaAlunoExiste: existeTurmaAluno.existe,
    turmaAluno: colunasTurmaAlunoSet,
  };

  return schemaCache;
}

function fmtHora(exprColuna) {
  return `CASE WHEN ${exprColuna} IS NULL THEN NULL ELSE TO_CHAR(${exprColuna}, 'HH24:MI') END`;
}

async function listarTodas() {
  const schema = await carregarSchema();
  const c = schema.turma;

  const professorExpr = c.has("professor_id")
    ? "t.professor_id"
    : c.has("id_professor")
      ? "t.id_professor"
      : "NULL::integer";

  const quadraExpr = c.has("quadra_id") ? "t.quadra_id" : "NULL::integer";
  const modalidadeExpr = c.has("id_modalidade") ? "t.id_modalidade" : "NULL::integer";
  const nomeExpr = c.has("nome") ? "t.nome" : "NULL::varchar";
  const nivelExpr = c.has("nivel") ? "t.nivel" : "NULL::varchar";
  const capExpr = c.has("capacidade_maxima") ? "COALESCE(t.capacidade_maxima, 0)" : "0";
  const diaExpr = c.has("dia_semana") ? "t.dia_semana" : "NULL::varchar";
  const hiExpr = c.has("hora_inicio") ? fmtHora("t.hora_inicio") : "NULL::varchar";
  const hfExpr = c.has("hora_fim") ? fmtHora("t.hora_fim") : "NULL::varchar";
  const diasHorariosExpr = c.has("dias_horarios") ? "t.dias_horarios" : "NULL::varchar";
  const criadoExpr = c.has("criado_em") ? "t.criado_em" : "NULL::timestamp";

  const joinMatriculas = schema.turmaAlunoExiste
    ? `
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS total
        FROM turma_aluno ta
        WHERE ta.id_turma = t.id_turma
      ) m ON TRUE
    `
    : `
      LEFT JOIN LATERAL (
        SELECT 0::int AS total
      ) m ON TRUE
    `;

  return db.any(
    `
    SELECT
      t.id_turma,
      ${quadraExpr} AS quadra_id,
      ${professorExpr} AS professor_id,
      ${modalidadeExpr} AS id_modalidade,
      ${nomeExpr} AS nome,
      ${diaExpr} AS dia_semana,
      ${hiExpr} AS hora_inicio,
      ${hfExpr} AS hora_fim,
      ${diasHorariosExpr} AS dias_horarios,
      ${nivelExpr} AS nivel,
      ${capExpr}::int AS capacidade_maxima,
      ${criadoExpr} AS criado_em,
      COALESCE(m.total, 0)::int AS matriculados,
      GREATEST(${capExpr}::int - COALESCE(m.total, 0)::int, 0)::int AS vagas_disponiveis
    FROM turma t
    ${joinMatriculas}
    ORDER BY t.id_turma DESC
    `
  );
}

async function buscarPorId(id) {
  const idTurma = Number(id);
  if (!Number.isInteger(idTurma) || idTurma <= 0) {
    throw criarErro("ID da turma inválido.", 400, "ID_INVALIDO");
  }

  const schema = await carregarSchema();
  const c = schema.turma;

  const professorExpr = c.has("professor_id")
    ? "t.professor_id"
    : c.has("id_professor")
      ? "t.id_professor"
      : "NULL::integer";

  const quadraExpr = c.has("quadra_id") ? "t.quadra_id" : "NULL::integer";
  const modalidadeExpr = c.has("id_modalidade") ? "t.id_modalidade" : "NULL::integer";
  const nomeExpr = c.has("nome") ? "t.nome" : "NULL::varchar";
  const nivelExpr = c.has("nivel") ? "t.nivel" : "NULL::varchar";
  const capExpr = c.has("capacidade_maxima") ? "COALESCE(t.capacidade_maxima, 0)" : "0";
  const diaExpr = c.has("dia_semana") ? "t.dia_semana" : "NULL::varchar";
  const hiExpr = c.has("hora_inicio") ? fmtHora("t.hora_inicio") : "NULL::varchar";
  const hfExpr = c.has("hora_fim") ? fmtHora("t.hora_fim") : "NULL::varchar";
  const diasHorariosExpr = c.has("dias_horarios") ? "t.dias_horarios" : "NULL::varchar";
  const criadoExpr = c.has("criado_em") ? "t.criado_em" : "NULL::timestamp";

  const joinMatriculas = schema.turmaAlunoExiste
    ? `
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS total
        FROM turma_aluno ta
        WHERE ta.id_turma = t.id_turma
      ) m ON TRUE
    `
    : `
      LEFT JOIN LATERAL (
        SELECT 0::int AS total
      ) m ON TRUE
    `;

  return db.oneOrNone(
    `
    SELECT
      t.id_turma,
      ${quadraExpr} AS quadra_id,
      ${professorExpr} AS professor_id,
      ${modalidadeExpr} AS id_modalidade,
      ${nomeExpr} AS nome,
      ${diaExpr} AS dia_semana,
      ${hiExpr} AS hora_inicio,
      ${hfExpr} AS hora_fim,
      ${diasHorariosExpr} AS dias_horarios,
      ${nivelExpr} AS nivel,
      ${capExpr}::int AS capacidade_maxima,
      ${criadoExpr} AS criado_em,
      COALESCE(m.total, 0)::int AS matriculados,
      GREATEST(${capExpr}::int - COALESCE(m.total, 0)::int, 0)::int AS vagas_disponiveis
    FROM turma t
    ${joinMatriculas}
    WHERE t.id_turma = $1
    `,
    [idTurma]
  );
}

async function criar(dados) {
  const schema = await carregarSchema();
  const c = schema.turma;

  const professorId = Number(dados.professor_id ?? dados.id_professor);
  if (!Number.isInteger(professorId) || professorId <= 0) {
    throw criarErro("professor_id inválido.", 400, "DADO_INVALIDO");
  }

  const capacidade = Number(dados.capacidade_maxima);
  if (!Number.isInteger(capacidade) || capacidade < 3 || capacidade > 6) {
    throw criarErro("capacidade_maxima deve ser inteiro entre 3 e 6.", 400, "DADO_INVALIDO");
  }

  const colunas = [];
  const valores = [];
  const params = [];

  const push = (coluna, valor) => {
    colunas.push(coluna);
    valores.push(`$${valores.length + 1}`);
    params.push(valor);
  };

  // professor (novo ou legado)
  if (c.has("professor_id")) {
    push("professor_id", professorId);
  } else if (c.has("id_professor")) {
    push("id_professor", professorId);
  } else {
    throw criarErro("A tabela turma não possui coluna de professor.", 500, "SCHEMA_INVALIDO");
  }

  if (c.has("quadra_id")) {
    const quadraId = dados.quadra_id == null || dados.quadra_id === "" ? null : Number(dados.quadra_id);
    push("quadra_id", Number.isInteger(quadraId) && quadraId > 0 ? quadraId : null);
  }

  if (c.has("id_modalidade")) {
    const modalidade = dados.id_modalidade == null || dados.id_modalidade === "" ? null : Number(dados.id_modalidade);
    push("id_modalidade", Number.isInteger(modalidade) && modalidade > 0 ? modalidade : null);
  }

  if (c.has("nome")) {
  const nomeAuto =
    dados.nome ??
    `Turma ${dados.nivel ?? ""} - ${dados.dia_semana ?? dados.dias_horarios ?? ""}`.trim();
  push("nome", nomeAuto);
  }

  if (c.has("nivel")) {
    push("nivel", dados.nivel ?? null);
  }

  if (c.has("dia_semana")) {
    push("dia_semana", dados.dia_semana ?? null);
  }

  if (c.has("hora_inicio")) {
    push("hora_inicio", dados.hora_inicio ?? null);
  }

  if (c.has("hora_fim")) {
    push("hora_fim", dados.hora_fim ?? null);
  }

  if (c.has("dias_horarios")) {
    const diasHorarios =
      dados.dias_horarios ??
      (dados.dia_semana && dados.hora_inicio && dados.hora_fim
        ? `${dados.dia_semana} ${dados.hora_inicio}-${dados.hora_fim}`
        : null);

    push("dias_horarios", diasHorarios);
  }

  if (c.has("capacidade_maxima")) {
    push("capacidade_maxima", capacidade);
  }

  if (c.has("criado_em")) {
    colunas.push("criado_em");
    valores.push("NOW()");
  }

  if (colunas.length === 0) {
    throw criarErro("Nenhuma coluna válida para inserir em turma.", 500, "SCHEMA_INVALIDO");
  }

  const sql = `
    INSERT INTO turma (${colunas.join(", ")})
    VALUES (${valores.join(", ")})
    RETURNING *
  `;

  return db.one(sql, params);
}

async function matricularAluno(id_turma, id_aluno) {
  const turmaId = Number(id_turma);
  const alunoId = Number(id_aluno);

  if (!Number.isInteger(turmaId) || turmaId <= 0) {
    throw criarErro("id_turma inválido.", 400, "DADO_INVALIDO");
  }

  if (!Number.isInteger(alunoId) || alunoId <= 0) {
    throw criarErro("id_aluno inválido.", 400, "DADO_INVALIDO");
  }

  const schema = await carregarSchema();

  if (!schema.turmaAlunoExiste) {
    throw criarErro(
      "Tabela turma_aluno não existe no banco. Crie a tabela para habilitar matrícula.",
      500,
      "TABELA_AUSENTE"
    );
  }

  const turma = await buscarPorId(turmaId);
  if (!turma) {
    throw criarErro("Turma não encontrada.", 404, "NAO_ENCONTRADO");
  }

  // impede exceder capacidade
  if (Number(turma.matriculados) >= Number(turma.capacidade_maxima)) {
    throw criarErro("Turma lotada.", 409, "TURMA_LOTADA");
  }

  const resultado = await db.oneOrNone(
    `
    INSERT INTO turma_aluno (id_turma, id_aluno, data_matricula)
    VALUES ($1, $2, NOW())
    ON CONFLICT (id_turma, id_aluno) DO NOTHING
    RETURNING id_turma
    `,
    [turmaId, alunoId]
  );

  return { jaMatriculado: !resultado };
}

async function listarAlunosDaTurma(id_turma) {
  const turmaId = Number(id_turma);
  if (!Number.isInteger(turmaId) || turmaId <= 0) {
    throw criarErro("id_turma inválido.", 400, "DADO_INVALIDO");
  }

  const schema = await carregarSchema();
  if (!schema.turmaAlunoExiste) return [];

  return db.any(
    `
    SELECT id_turma, id_aluno, data_matricula
    FROM turma_aluno
    WHERE id_turma = $1
    ORDER BY data_matricula DESC
    `,
    [turmaId]
  );
}

module.exports = {
  listarTodas,
  buscarPorId,
  criar,
  matricularAluno,
  listarAlunosDaTurma,
};