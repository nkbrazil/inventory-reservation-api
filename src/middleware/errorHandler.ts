import { Request, Response, NextFunction } from "express";
import { success } from "zod";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR", error);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res
    .status(statusCode)
    .json({ success: false, error: error.message || "Internal Server Error" });
};
