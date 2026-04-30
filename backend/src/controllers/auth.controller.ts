import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json({ ok: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ ok: true, data: result });
});

export const requestEmailOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestEmailOtp(req.body);
  res.json({ ok: true, data: result });
});

export const verifyEmailOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmailOtp(req.body);
  res.json({ ok: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.auth!.userId);
  res.json({ ok: true, data: { user } });
});
