"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateParams = exports.validateBody = void 0;
// validating request body
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: result.error,
        });
    }
    req.body = result.data;
    next();
};
exports.validateBody = validateBody;
// validating request params
const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: result.error,
        });
    }
    req.params = result.data;
    next();
};
exports.validateParams = validateParams;
exports.validate = exports.validateBody;
