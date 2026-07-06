// backend/middlewares/asyncHandler.js
function asyncHandler(fn) {
    return (req, res, next) => {
        // Envolve a função em uma Promise e, se der erro, passa para o 'next'
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;