import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/domain.js";
import { unauthorized, forbidden } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/tokens.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(unauthorized("Missing bearer token"));

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
    role: payload.role,
    };
    return next();
  } catch {
    return next(unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(unauthorized());
    if (!roles.includes(req.auth.role)) return next(forbidden("Role not allowed"));
    return next();
  };
}
