// =============================================================
// MODEL: QuadraModel  (tabela `quadra`)
// -------------------------------------------------------------
// Colunas do schema: id_quadra, nome, descricao, tamanho,
// coberta (bool), ativa (bool).
// O schema NÃO possui coluna de preço nem "tipo_piso"; por isso:
//   • tipo_piso (frontend) é persistido em `tamanho`;
//   • preco_hora é exposto com um valor padrão (PRECO_PADRAO),
//     pois a precificação real é calculada no agendamento.
// =============================================================
const db = require('../config/db');

const PRECO_PADRAO = 60;

function formatar(row) {
    if (!row) return row;
    return {
        id: row.id_quadra,
        nome: row.nome,
        descricao: row.descricao || '',
        tipo_piso: row.tamanho || '',
        preco_hora: PRECO_PADRAO,
        coberta: row.coberta,
        status: row.ativa ? 'ativa' : 'inativa',
    };
}

async function listarTodos() {
    const linhas = await db.any('SELECT * FROM quadra ORDER BY nome ASC');
    return linhas.map(formatar);
}

async function buscarPorId(id) {
    const row = await db.oneOrNone('SELECT * FROM quadra WHERE id_quadra = $1', [id]);
    return formatar(row);
}

async function criar(dados) {
    const row = await db.one(`
        INSERT INTO quadra (nome, descricao, tamanho, coberta, ativa)
        VALUES ($/nome/, $/descricao/, $/tamanho/, $/coberta/, $/ativa/)
        RETURNING *
    `, {
        nome: dados.nome,
        descricao: dados.descricao || null,
        tamanho: dados.tipo_piso ?? dados.tamanho ?? null,
        coberta: dados.coberta ?? false,
        ativa: dados.status ? dados.status === 'ativa' : true,
    });
    return formatar(row);
}

async function atualizar(id, dados) {
    const sets = [];
    const valores = { id };

    if (dados.nome !== undefined) { sets.push('nome = $/nome/'); valores.nome = dados.nome; }
    if (dados.descricao !== undefined) { sets.push('descricao = $/descricao/'); valores.descricao = dados.descricao; }
    if (dados.tipo_piso !== undefined || dados.tamanho !== undefined) {
        sets.push('tamanho = $/tamanho/');
        valores.tamanho = dados.tipo_piso ?? dados.tamanho;
    }
    if (dados.coberta !== undefined) { sets.push('coberta = $/coberta/'); valores.coberta = dados.coberta; }
    if (dados.status !== undefined) { sets.push('ativa = $/ativa/'); valores.ativa = dados.status === 'ativa'; }

    if (sets.length === 0) return await buscarPorId(id);

    const row = await db.oneOrNone(`
        UPDATE quadra SET ${sets.join(', ')}
        WHERE id_quadra = $/id/
        RETURNING *
    `, valores);
    return formatar(row);
}

// Exclusão lógica: desativa a quadra (preserva histórico de agendamentos).
async function remover(id) {
    return await db.oneOrNone(
        'UPDATE quadra SET ativa = FALSE WHERE id_quadra = $1 RETURNING id_quadra',
        [id]
    );
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover, formatar };
