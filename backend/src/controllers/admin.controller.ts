import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as adminService from "../services/admin.service.js";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.loginAdmin(req.body);
  res.json({ ok: true, data: result });
});

export const me = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ ok: true, data: { user: adminService.getAdminUser() } });
});

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getPlatformDashboard();
  res.json({ ok: true, data });
});

export const updateOwnerSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await adminService.updateOwnerSubscription(req.params.id, req.body);
  res.json({ ok: true, data: { subscription } });
});
