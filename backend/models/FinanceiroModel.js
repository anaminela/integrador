// =============================================================
// MODEL: FinanceiroModel  (RF10/RF11/RF12)
// -------------------------------------------------------------
// ATENÇÃO: o schema fornecido (g2_arena) NÃO possui a tabela
// `financeiro`. Para manter os endpoints financeiros funcionais
// sem quebrar (500), as transações são mantidas em memória.
// (Para persistência real, criar a tabela `financeiro` e trocar
//  este armazenamento por consultas ao banco.)
// =============================================================
const transacoes = [];
let proximoId = 1;

async function listarTodos() {
    return [...transacoes].sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
}

async function buscarPorId(id) {
    return transacoes.find((t) => t.id_transacao === Number(id)) || null;
}

async function criar(dados) {
    const transacao = {
        id_transacao: proximoId++,
        id_usuario: dados.id_usuario ?? null,
        id_agendamento: dados.id_agendamento ?? null,
        tipo: dados.tipo ?? 'ENTRADA',
        categoria: dados.categoria ?? 'outros',
        valor: Number(dados.valor ?? 0),
        forma_pagamento: dados.forma_pagamento ?? 'dinheiro',
        status: dados.status ?? 'PENDENTE',
        data_transacao: new Date().toISOString(),
    };
    transacoes.push(transacao);
    return transacao;
}

async function atualizarStatus(id, novoStatus) {
    const transacao = transacoes.find((t) => t.id_transacao === Number(id));
    if (!transacao) return null;
    transacao.status = novoStatus;
    return transacao;
}

module.exports = { listarTodos, buscarPorId, criar, atualizarStatus };
