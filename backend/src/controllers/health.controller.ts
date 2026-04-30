import type { Request, Response } from "express";

export function health(_req: Request, res: Response) {
  res.json({ ok: true, data: { status: "healthy", timestamp: new Date().toISOString() } });
}
