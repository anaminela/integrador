const respostaErro = (res, mensagem, extras = {}) =>
  res.status(400).json({ status: "erro", mensagem, ...extras });

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizarNivel(nivel) {
  const n = String(nivel || "").trim().toLowerCase();
  if (n === "avancado") return "avançado";
  return n;
}

const validarCriacaoTurma = (req, res, next) => {
  const body = req.body || {};
  const faltando = [];

  // aceita professor_id (novo) ou id_professor (legado)
  const professorRaw = body.professor_id ?? body.id_professor;
  const professor_id = Number(professorRaw);

  if (!Number.isInteger(professor_id) || professor_id <= 0) {
    faltando.push("professor_id");
  }

  const nivel = normalizarNivel(body.nivel);
  const niveisPermitidos = ["iniciante", "intermediário", "avançado"];
  if (!niveisPermitidos.includes(nivel)) {
    return respostaErro(res, `O nível deve ser: ${niveisPermitidos.join(", ")}`);
  }

  const cap = Number(body.capacidade_maxima);
  if (!Number.isInteger(cap) || cap < 3 || cap > 6) {
    return respostaErro(res, "A capacidade da turma deve ser entre 3 e 6 pessoas.");
  }

  // formato novo (dia/hora) OU legado (dias_horarios)
  const temDiaHora = body.dia_semana && body.hora_inicio && body.hora_fim;
  const temDiasHorarios = body.dias_horarios && String(body.dias_horarios).trim().length > 0;

  if (!temDiaHora && !temDiasHorarios) {
    return respostaErro(
      res,
      "Informe 'dias_horarios' ou o conjunto 'dia_semana', 'hora_inicio' e 'hora_fim'."
    );
  }

  if (temDiaHora) {
    if (!HHMM.test(String(body.hora_inicio))) {
      return respostaErro(res, "hora_inicio deve estar no formato HH:MM.");
    }
    if (!HHMM.test(String(body.hora_fim))) {
      return respostaErro(res, "hora_fim deve estar no formato HH:MM.");
    }
    if (String(body.hora_inicio) >= String(body.hora_fim)) {
      return respostaErro(res, "hora_fim deve ser maior que hora_inicio.");
    }
  }

  if (body.quadra_id !== undefined && body.quadra_id !== null && body.quadra_id !== "") {
    const q = Number(body.quadra_id);
    if (!Number.isInteger(q) || q <= 0) {
      return respostaErro(res, "quadra_id deve ser um inteiro positivo.");
    }
    body.quadra_id = q;
  }

  if (body.id_modalidade !== undefined && body.id_modalidade !== null && body.id_modalidade !== "") {
    const m = Number(body.id_modalidade);
    if (!Number.isInteger(m) || m <= 0) {
      return respostaErro(res, "id_modalidade deve ser um inteiro positivo.");
    }
    body.id_modalidade = m;
  }

  if (faltando.length > 0) {
    return respostaErro(res, "Campos obrigatórios ausentes ou inválidos.", {
      campos_faltando: faltando,
    });
  }

  // normaliza payload para o model/controller
  body.professor_id = professor_id;
  body.nivel = nivel;
  body.capacidade_maxima = cap;

  if (!temDiasHorarios && temDiaHora) {
    body.dias_horarios = `${body.dia_semana} ${body.hora_inicio}-${body.hora_fim}`;
  }

  req.body = body;
  next();
};

module.exports = { validarCriacaoTurma };