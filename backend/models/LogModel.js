// =============================================================
// MODEL: LogModel  (auditoria / RF16)
// -------------------------------------------------------------
// ATENÇÃO: o schema fornecido (g2_arena) NÃO possui a tabela
// `log_auditoria`. Para não quebrar as requisições nem poluir o
// console com erros de SQL, a auditoria é mantida em memória.
// (Para persistência real, criar a tabela log_auditoria e trocar
//  este armazenamento por consultas ao banco.)
// =============================================================
const logs = [];
let proximoId = 1;

async function listarTodos() {
    // Mais recentes primeiro.
    return [...logs].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
}

async function registrar(dados) {
    const registro = {
        id_log: proximoId++,
        id_usuario: dados.id_usuario ?? dados.usuario_id ?? null,
        nome_completo: dados.nome_completo ?? null,
        acao: dados.acao || 'AÇÃO DO SISTEMA',
        descricao: dados.descricao || dados.recurso || 'Sem descrição',
        recurso: dados.recurso ?? null,
        status_http: dados.status_http ?? null,
        ip: dados.ip ?? null,
        data_hora: new Date().toISOString(),
    };
    logs.push(registro);
    // Mantém apenas os últimos 500 registros em memória.
    if (logs.length > 500) logs.shift();
    return registro;
}

module.exports = { listarTodos, registrar };
