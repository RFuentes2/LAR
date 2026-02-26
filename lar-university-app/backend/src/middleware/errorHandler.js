/**
 * Global Error Handler Middleware
 */

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Error interno del servidor';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join('. ');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Ya existe un registro con ese ${field}. Por favor usa uno diferente.`;
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `ID inválido: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido. Por favor inicia sesión nuevamente.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
