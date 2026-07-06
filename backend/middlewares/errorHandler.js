// backend/middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
    // Imprime o erro no console do servidor para você conseguir debugar
    console.error(`[ERRO]: ${new Date().toISOString()}`, err.stack);

    // Se o erro tiver um status code definido (ex: 404, 400), usa ele. Se não, é erro 500
    const status = err.statusCode || 500;
    const mensagem = status < 500 ? err.message : 'Erro interno no servidor. Tente novamente mais tarde.';

    res.status(status).json({
        erro: mensagem,
        codigo: err.codigo || (status < 500 ? 'ERRO_CLIENTE' : 'ERRO_INTERNO')
    });
}

module.exports = errorHandler;