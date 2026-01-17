"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error("Error:", error.message);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || "Internal Server Error",
    });
};
exports.errorHandler = errorHandler;
