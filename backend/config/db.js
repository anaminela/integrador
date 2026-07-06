// =============================================================
// CONFIGURAÇÃO DA CONEXÃO COM O BANCO (PostgreSQL via pg-promise)
// -------------------------------------------------------------
// Os valores vêm de variáveis de ambiente (.env), com defaults
// voltados ao ambiente de desenvolvimento do projeto.
// O banco padrão do projeto é "g2_arena".
// =============================================================
require('dotenv').config();

const pgp = require('pg-promise')();

const db = pgp({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'g2_arena',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    max:      Number(process.env.DB_POOL_MAX) || 10,
});

module.exports = db;
