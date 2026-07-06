// --- Funções Auxiliares Restauradas ---
const dataValida = (str) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  return !isNaN(new Date(str + "T12:00:00").getTime());
};

const horaValida = (str) => /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const respostaErro = (res, mensagem, extras = {}) => 
  res.status(400).json({ status: "erro", mensagem, ...extras });

const validarDisponibilidade = (req, res, next) => {
  const quadra_id = Number(req.query.quadra_id);
  const { data } = req.query;

  if (!quadra_id || !Number.isInteger(quadra_id) || quadra_id <= 0) {
    return respostaErro(res, "Parâmetro 'quadra_id' obrigatório e deve ser inteiro positivo.");
  }
  if (!data || !dataValida(data)) {
    return respostaErro(res, "Parâmetro 'data' obrigatório no formato YYYY-MM-DD.");
  }
  next();
};

const validarPayloadAgendamento = (req, res, next) => {
  const { quadra_id, data, hora_inicio, hora_fim, tipo, esporte } = req.body;
  const faltando = [];

  if (!quadra_id) faltando.push("quadra_id");
  if (!data) faltando.push("data");
  if (!hora_inicio) faltando.push("hora_inicio");
  if (!hora_fim) faltando.push("hora_fim");
  
  // 'tipo' e 'esporte' são obrigatórios na criação real, mas na fila de espera o usuário pode omitir.
  // Como reaproveitamos essa lógica, checaremos apenas se a rota for de criação principal.
  if (req.path === "/" && req.method === "POST") {
    if (!tipo) faltando.push("tipo");
    if (!esporte) faltando.push("esporte");
  }

  if (faltando.length > 0) return respostaErro(res, "Campos obrigatórios ausentes.", { campos_faltando: faltando });

  if (!Number.isInteger(Number(quadra_id)) || Number(quadra_id) <= 0) {
    return respostaErro(res, "'quadra_id' deve ser inteiro positivo.");
  }
  if (!dataValida(data)) return respostaErro(res, "'data' inválida. Use YYYY-MM-DD.");
  if (!horaValida(hora_inicio) || !horaValida(hora_fim)) {
    return respostaErro(res, "'hora_inicio' e 'hora_fim' devem estar no formato HH:MM.");
  }
  if (tipo && !["avulso", "mensal"].includes(tipo)) {
    return respostaErro(res, "'tipo' deve ser 'avulso' ou 'mensal'.");
  }
  if (paraMinutos(hora_fim) <= paraMinutos(hora_inicio)) {
    return respostaErro(res, "'hora_fim' deve ser posterior a 'hora_inicio'.");
  }

  next();
};

const validarStatusReserva = (req, res, next) => {
  const { status } = req.body;
  if (!["confirmado", "cancelado", "pendente"].includes(status)) {
    return respostaErro(res, "'status' deve ser: confirmado | cancelado | pendente");
  }
  next();
};

const validarFilaQuery = (req, res, next) => {
  const { quadra_id, data, hora_inicio } = req.query;
  if (!quadra_id || !data || !hora_inicio) {
    return respostaErro(res, "Parâmetros obrigatórios: quadra_id, data, hora_inicio.");
  }
  next();
};

module.exports = {
  validarDisponibilidade,
  validarPayloadAgendamento,
  validarStatusReserva,
  validarFilaQuery
};