const db = require('../config/db');

const HORA_ABERTURA = 7;
const HORA_FECHAMENTO = 22;
const PRECO_PADRAO = 60;
const PRECO_NOBRE = 90;
const HORA_NOBRE_INICIO = 18;

const TIPO_PARA_DB = { avulso: 'AVULSO', mensal: 'MENSAL', treino: 'TREINO', evento: 'EVENTO' };
const STATUS_DB_PARA_FE = {
    SOLICITADO: 'pendente', APROVADO: 'confirmado', CONCLUIDO: 'confirmado',
    CANCELADO: 'cancelado', RECUSADO: 'cancelado',
};
const STATUS_FE_PARA_DB = { confirmado: 'APROVADO', pendente: 'SOLICITADO', cancelado: 'CANCELADO' };

function ehHorarioNobre(hora) {
    const h = parseInt(String(hora).slice(0, 2), 10);
    return h >= HORA_NOBRE_INICIO;
}

function calcularPreco(hora_inicio, hora_fim) {
    const hi = parseInt(String(hora_inicio).slice(0, 2), 10);
    const hf = parseInt(String(hora_fim).slice(0, 2), 10);
    const horas = Math.max(1, hf - hi);
    return (ehHorarioNobre(hora_inicio) ? PRECO_NOBRE : PRECO_PADRAO) * horas;
}

function formatar(row) {
    if (!row) return row;
    return {
        id: row.id_agendamento,
        quadra_id: row.id_quadra,
        quadra_nome: row.quadra_nome,
        usuario_id: row.id_cliente,
        cliente_nome: row.cliente_nome,
        data: row.data_reserva,
        hora_inicio: row.hora_inicio ? String(row.hora_inicio).slice(0, 5) : row.hora_inicio,
        hora_fim: row.hora_fim ? String(row.hora_fim).slice(0, 5) : row.hora_fim,
        tipo: (row.tipo_reserva || '').toLowerCase(),
        esporte: row.modalidade_nome || '',
        preco: Number(row.preco),
        horario_nobre: ehHorarioNobre(row.hora_inicio),
        status: STATUS_DB_PARA_FE[row.status] || 'pendente',
        criado_em: row.criado_em,
    };
}

const SELECT_BASE = `
    SELECT a.*, q.nome AS quadra_nome, m.nome AS modalidade_nome,
           u.nome_completo AS cliente_nome
    FROM agendamento a
    JOIN quadra q      ON q.id_quadra = a.id_quadra
    JOIN modalidade m  ON m.id_modalidade = a.id_modalidade
    JOIN usuario u     ON u.id_usuario = a.id_cliente
`;


async function obterModalidadeId(nomeEsporte) {
    const nome = (nomeEsporte || 'Geral').trim();
    const existente = await db.oneOrNone('SELECT id_modalidade FROM modalidade WHERE LOWER(nome) = LOWER($1)', [nome]);
    if (existente) return existente.id_modalidade;
    const criada = await db.one('INSERT INTO modalidade (nome) VALUES ($1) RETURNING id_modalidade', [nome]);
    return criada.id_modalidade;
}

async function listarTodos(filtros = {}) {
    const cond = [];
    const valores = {};
    if (filtros.usuario_id) { cond.push('a.id_cliente = $/usuario_id/'); valores.usuario_id = filtros.usuario_id; }
    if (filtros.quadra_id)  { cond.push('a.id_quadra = $/quadra_id/'); valores.quadra_id = filtros.quadra_id; }
    if (filtros.data)       { cond.push('a.data_reserva = $/data/'); valores.data = filtros.data; }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    const linhas = await db.any(`${SELECT_BASE} ${where} ORDER BY a.data_reserva DESC, a.hora_inicio ASC`, valores);
    return linhas.map(formatar);
}

async function buscarPorId(id) {
    const row = await db.oneOrNone(`${SELECT_BASE} WHERE a.id_agendamento = $1`, [id]);
    return formatar(row);
}

// Conflito: existe agendamento ativo que se sobrepõe ao intervalo?
async function verificarDisponibilidade(id_quadra, data, hora_inicio, hora_fim) {
    return await db.oneOrNone(`
        SELECT id_agendamento FROM agendamento
        WHERE id_quadra = $1 AND data_reserva = $2
          AND status IN ('SOLICITADO','APROVADO')
          AND hora_inicio < $4 AND hora_fim > $3
    `, [id_quadra, data, hora_inicio, hora_fim]);
}

async function criar(dados) {
    const id_modalidade = await obterModalidadeId(dados.esporte);
    const hora_inicio = dados.hora_inicio.length === 5 ? `${dados.hora_inicio}:00` : dados.hora_inicio;
    const hora_fim = dados.hora_fim.length === 5 ? `${dados.hora_fim}:00` : dados.hora_fim;
    const preco = dados.preco != null ? dados.preco : calcularPreco(dados.hora_inicio, dados.hora_fim);

    const row = await db.one(`
        INSERT INTO agendamento
        (id_cliente, id_quadra, id_modalidade, id_usuario_criador,
         data_reserva, hora_inicio, hora_fim, tipo_reserva, status, preco)
        VALUES
        ($/id_cliente/, $/id_quadra/, $/id_modalidade/, $/id_usuario_criador/,
         $/data_reserva/, $/hora_inicio/, $/hora_fim/, $/tipo_reserva/, $/status/, $/preco/)
        RETURNING id_agendamento
    `, {
        id_cliente: dados.id_cliente,
        id_quadra: dados.id_quadra,
        id_modalidade,
        id_usuario_criador: dados.id_usuario_criador || dados.id_cliente,
        data_reserva: dados.data,
        hora_inicio,
        hora_fim,
        tipo_reserva: TIPO_PARA_DB[(dados.tipo || 'avulso').toLowerCase()] || 'AVULSO',
        status: dados.status || 'APROVADO',
        preco,
    });
    return await buscarPorId(row.id_agendamento);
}

// Recebe status no vocabulário do frontend (confirmado/pendente/cancelado)
// ou já no formato do schema.
async function atualizarStatus(id, status) {
    const statusDb = STATUS_FE_PARA_DB[status] || status;
    const row = await db.oneOrNone(`
        UPDATE agendamento SET status = $2, atualizado_em = CURRENT_TIMESTAMP
        WHERE id_agendamento = $1
        RETURNING id_agendamento
    `, [id, statusDb]);
    if (!row) return null;
    return await buscarPorId(id);
}

// Gera a grade de horários (slots de 1h) marcando disponibilidade.
async function gerarSlotsDisponiveis(id_quadra, data) {
    const ocupados = await db.any(`
        SELECT hora_inicio, hora_fim FROM agendamento
        WHERE id_quadra = $1 AND data_reserva = $2 AND status IN ('SOLICITADO','APROVADO')
    `, [id_quadra, data]);

    const paraMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
    const slots = [];
    for (let h = HORA_ABERTURA; h < HORA_FECHAMENTO; h++) {
        const inicio = `${String(h).padStart(2, '0')}:00`;
        const fim = `${String(h + 1).padStart(2, '0')}:00`;
        const iniMin = paraMin(inicio);
        const fimMin = paraMin(fim);
        const conflito = ocupados.some((o) => paraMin(o.hora_inicio) < fimMin && paraMin(o.hora_fim) > iniMin);
        slots.push({
            hora_inicio: inicio,
            hora_fim: fim,
            disponivel: !conflito,
            horario_nobre: ehHorarioNobre(inicio),
            preco: ehHorarioNobre(inicio) ? PRECO_NOBRE : PRECO_PADRAO,
        });
    }
    return slots;
}

// ---- Fila de espera (tabela fila_espera) ----
async function entrarNaFila(dados) {
    const id_modalidade = await obterModalidadeId(dados.esporte);
    const hora_inicio = dados.hora_inicio.length === 5 ? `${dados.hora_inicio}:00` : dados.hora_inicio;
    const hora_fim = dados.hora_fim && dados.hora_fim.length === 5 ? `${dados.hora_fim}:00` : dados.hora_fim;

    const posicaoRow = await db.one(`
        SELECT COALESCE(MAX(posicao), 0) + 1 AS proxima
        FROM fila_espera
        WHERE id_quadra = $1 AND data_reserva = $2 AND hora_inicio = $3 AND status = 'AGUARDANDO'
    `, [dados.id_quadra, dados.data, hora_inicio]);

    return await db.one(`
        INSERT INTO fila_espera
        (id_cliente, id_quadra, id_modalidade, data_reserva, hora_inicio, hora_fim, posicao)
        VALUES ($/id_cliente/, $/id_quadra/, $/id_modalidade/, $/data/, $/hora_inicio/, $/hora_fim/, $/posicao/)
        RETURNING *
    `, {
        id_cliente: dados.id_cliente,
        id_quadra: dados.id_quadra,
        id_modalidade,
        data: dados.data,
        hora_inicio,
        hora_fim,
        posicao: posicaoRow.proxima,
    });
}

async function listarFila(filtros = {}) {
    const cond = ["f.status = 'AGUARDANDO'"];
    const valores = {};
    if (filtros.quadra_id)   { cond.push('f.id_quadra = $/quadra_id/'); valores.quadra_id = filtros.quadra_id; }
    if (filtros.data)        { cond.push('f.data_reserva = $/data/'); valores.data = filtros.data; }
    if (filtros.hora_inicio) {
        const hi = filtros.hora_inicio.length === 5 ? `${filtros.hora_inicio}:00` : filtros.hora_inicio;
        cond.push('f.hora_inicio = $/hora_inicio/'); valores.hora_inicio = hi;
    }
    return await db.any(`
        SELECT f.*, u.nome_completo AS cliente_nome
        FROM fila_espera f
        JOIN usuario u ON u.id_usuario = f.id_cliente
        WHERE ${cond.join(' AND ')}
        ORDER BY f.posicao ASC
    `, valores);
}

async function sairDaFila(id) {
    return await db.none("UPDATE fila_espera SET status = 'CANCELADO' WHERE id_fila = $1", [id]);
}

module.exports = {
    listarTodos, buscarPorId, verificarDisponibilidade, criar, atualizarStatus,
    gerarSlotsDisponiveis, entrarNaFila, listarFila, sairDaFila, obterModalidadeId,
};
