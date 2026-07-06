const db = require('../config/db');

function formatar(row) {
    if (!row) return row;
    return {
        id: row.id_produto,
        nome: row.nome,
        descricao: '',
        categoria: row.categoria,
        quantidade: row.qtd_estoque,
        estoque_minimo: row.estoque_minimo,
        preco_custo: Number(row.preco_custo),
        preco_venda: Number(row.preco_venda),
        ativo: row.ativo,
    };
}

async function listarTodos() {
    const linhas = await db.any('SELECT * FROM produto WHERE ativo = TRUE ORDER BY nome ASC');
    return linhas.map(formatar);
}

async function buscarPorId(id) {
    const row = await db.oneOrNone('SELECT * FROM produto WHERE id_produto = $1', [id]);
    return formatar(row);
}

async function criar(dados) {
    const row = await db.one(`
        INSERT INTO produto (nome, categoria, qtd_estoque, estoque_minimo, preco_custo, preco_venda)
        VALUES ($/nome/, $/categoria/, $/qtd_estoque/, $/estoque_minimo/, $/preco_custo/, $/preco_venda/)
        RETURNING *
    `, {
        nome: dados.nome,
        categoria: dados.categoria,
        qtd_estoque: dados.quantidade ?? dados.qtd_estoque ?? 0,
        estoque_minimo: dados.estoque_minimo ?? 0,
        preco_custo: dados.preco_custo ?? 0,
        preco_venda: dados.preco_venda ?? 0,
    });
    return formatar(row);
}

async function atualizar(id, dados) {
    const sets = [];
    const valores = { id };
    if (dados.nome !== undefined) { sets.push('nome = $/nome/'); valores.nome = dados.nome; }
    if (dados.categoria !== undefined) { sets.push('categoria = $/categoria/'); valores.categoria = dados.categoria; }
    if (dados.quantidade !== undefined) { sets.push('qtd_estoque = $/qtd_estoque/'); valores.qtd_estoque = dados.quantidade; }
    if (dados.estoque_minimo !== undefined) { sets.push('estoque_minimo = $/estoque_minimo/'); valores.estoque_minimo = dados.estoque_minimo; }
    if (dados.preco_custo !== undefined) { sets.push('preco_custo = $/preco_custo/'); valores.preco_custo = dados.preco_custo; }
    if (dados.preco_venda !== undefined) { sets.push('preco_venda = $/preco_venda/'); valores.preco_venda = dados.preco_venda; }

    if (sets.length === 0) return await buscarPorId(id);

    const row = await db.oneOrNone(`
        UPDATE produto SET ${sets.join(', ')}
        WHERE id_produto = $/id/
        RETURNING *
    `, valores);
    return formatar(row);
}

async function atualizarEstoque(id, novaQuantidade) {
    const row = await db.oneOrNone(
        'UPDATE produto SET qtd_estoque = $2 WHERE id_produto = $1 RETURNING *',
        [id, novaQuantidade]
    );
    return formatar(row);
}

// Registra uma movimentação de estoque (ENTRADA ou SAIDA).
async function registrarMovimento({ id_produto, tipo, quantidade, origem }) {
    return await db.one(`
        INSERT INTO movimento_estoque (id_produto, tipo, quantidade, origem)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [id_produto, tipo, quantidade, origem || null]);
}

// Relatório de movimentações por período (RF8.3).
async function relatorioMovimentacoes(data_inicio, data_fim) {
    const cond = [];
    const valores = {};
    if (data_inicio) { cond.push('m.data_movimento >= $/inicio/'); valores.inicio = data_inicio; }
    if (data_fim) { cond.push('m.data_movimento < ($/fim/::date + INTERVAL \'1 day\')'); valores.fim = data_fim; }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';

    const linhas = await db.any(`
        SELECT m.id_movimento_estoque, m.id_produto, p.nome AS produto_nome,
               m.tipo, m.quantidade, m.origem, m.data_movimento,
               (m.quantidade * p.preco_venda) AS valor_total
        FROM movimento_estoque m
        JOIN produto p ON p.id_produto = m.id_produto
        ${where}
        ORDER BY m.data_movimento DESC
    `, valores);

    return linhas.map((m) => ({
        produto_id: m.produto_nome,
        tipo: m.tipo,
        quantidade: m.quantidade,
        valor_total: Number(m.valor_total),
        data: m.data_movimento,
    }));
}

// Exclusão lógica (evita violar FK com movimento_estoque).
async function remover(id) {
    return await db.none('UPDATE produto SET ativo = FALSE WHERE id_produto = $1', [id]);
}

module.exports = {
    listarTodos, buscarPorId, criar, atualizar, atualizarEstoque,
    registrarMovimento, relatorioMovimentacoes, remover, formatar,
};
