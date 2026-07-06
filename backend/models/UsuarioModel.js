const db = require('../config/db');

// Traduz o perfil do banco no par usado pelo frontend.
function mapearPerfil(perfilDb) {
    if (perfilDb === 'ADMINISTRADOR') return { perfil: 'interno', tipo_perfil: 'ADMINISTRADOR' };
    if (perfilDb === 'FUNCIONARIO' || perfilDb === 'PROFESSOR') return { perfil: 'interno', tipo_perfil: 'FUNCIONARIO' };
    return { perfil: 'cliente', tipo_perfil: null };
}

// Normaliza uma linha do banco para o formato consumido pelo frontend.
function formatar(row) {
    if (!row) return row;
    const { perfil, tipo_perfil } = mapearPerfil(row.perfil);
    return {
        id: row.id_usuario,
        nome: row.nome_completo,
        email: row.email,
        cpf: row.cpf_cnpj,
        telefone: row.telefone,
        perfil,
        tipo_perfil,
        perfil_db: row.perfil,
        ativo: row.ativo,
        aceite_termos: row.aceite_termos,
        criado_em: row.criado_em,
    };
}

async function listarTodos() {
    const linhas = await db.any('SELECT * FROM usuario ORDER BY criado_em DESC');
    return linhas.map(formatar);
}

async function buscarPorId(id) {
    const row = await db.oneOrNone('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
    return formatar(row);
}

// Retorna a linha CRUA (com senha_hash) — usada apenas na autenticação.
async function buscarPorEmail(email) {
    return await db.oneOrNone('SELECT * FROM usuario WHERE email = $1', [email]);
}

async function criar(dados) {
    const row = await db.one(`
        INSERT INTO usuario
        (nome_completo, telefone, email, cpf_cnpj, senha_hash, perfil, aceite_termos)
        VALUES
        ($/nome_completo/, $/telefone/, $/email/, $/cpf_cnpj/, $/senha_hash/, $/perfil/, $/aceite_termos/)
        RETURNING *
    `, {
        nome_completo: dados.nome_completo,
        telefone: dados.telefone,
        email: dados.email,
        cpf_cnpj: dados.cpf_cnpj,
        senha_hash: dados.senha_hash,
        perfil: dados.perfil || 'CLIENTE',
        aceite_termos: dados.aceite_termos ?? false,
    });
    return formatar(row);
}

// Atualização parcial: monta dinamicamente o SET apenas com os
// campos permitidos que foram enviados. Aceita tanto os nomes do
// frontend (nome, cpf) quanto os do schema (nome_completo, cpf_cnpj).
async function atualizar(id, dados) {
    const mapaColunas = {
        nome: 'nome_completo',
        nome_completo: 'nome_completo',
        telefone: 'telefone',
        email: 'email',
        cpf: 'cpf_cnpj',
        cpf_cnpj: 'cpf_cnpj',
        perfil: 'perfil',
        senha_hash: 'senha_hash',
        ativo: 'ativo',
    };

    const sets = [];
    const valores = { id };
    for (const [chave, valor] of Object.entries(dados)) {
        const coluna = mapaColunas[chave];
        if (!coluna || valor === undefined) continue;
        // Evita colunas duplicadas (ex.: nome e nome_completo juntos).
        if (sets.some((s) => s.startsWith(`${coluna} =`))) continue;
        sets.push(`${coluna} = $/${chave}/`);
        valores[chave] = valor;
    }

    if (sets.length === 0) {
        return await buscarPorId(id);
    }

    const row = await db.oneOrNone(`
        UPDATE usuario SET ${sets.join(', ')}
        WHERE id_usuario = $/id/
        RETURNING *
    `, valores);
    return formatar(row);
}

async function remover(id) {
    return await db.none('UPDATE usuario SET ativo = FALSE WHERE id_usuario = $1', [id]);
}

module.exports = { listarTodos, buscarPorId, buscarPorEmail, criar, atualizar, remover, formatar, mapearPerfil };
