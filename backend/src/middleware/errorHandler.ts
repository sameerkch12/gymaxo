import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.path}`, "ROUTE_NOT_FOUND"));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ok: false,
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Invalid request",
      issues: error.flatten(),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      ok: false,
      code: "INVALID_ID",
      message: "Invalid resource id",
    });
  }

  if (typeof error === "object" && error && "code" in error && error.code === 11000) {
    return res.status(409).json({
      ok: false,
      code: "CONFLICT",
      message: "A record with this unique value already exists",
    });
  }

  console.error(error);
  return res.status(500).json({
    ok: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
}
