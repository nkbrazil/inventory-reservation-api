import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// validating request body
export const validateBody =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
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

// validating request params
export const validateParams =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error,
      });
    }
    req.params = result.data as typeof req.params;
    next();
  };

export const validate = validateBody;
