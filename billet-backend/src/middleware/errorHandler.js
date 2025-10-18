const errorHandler = (error, req, res, next) => {
    console.log("⛔ Error:", error.message);
    console.log(" Stack:", error.stack);

    let errorResponse = {
        success: false,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
    };

    let statusCode = 500;

    // JWT Error Handler
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorResponse.error = "Invalid Token";
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        errorResponse.error = "Expired Token";
    }
    // Database Error Handler
    else if (error.code === '23505') {
        statusCode = 409;
        errorResponse.error = "Resource Already Exists";
    } else if (error.code === '23503') {
        statusCode = 400;
        errorResponse.error = "Invalid Reference";
    } else if (error.code === '23502') {
        statusCode = 400;
        errorResponse.error = "Missing required fields";
    }
    // Custom Application Error
    else if (error.statusCode) {
        statusCode = error.statusCode;
        errorResponse.error = error.message;
    }
    // Validation Error (express-validator)
    else if (error.errors) {
        statusCode = 400;
        errorResponse.error = 'Validation failed';
        errorResponse.details = error.errors;
    }

    // Development error details
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = error.message;
        errorResponse.stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);

};
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    AppError,
}