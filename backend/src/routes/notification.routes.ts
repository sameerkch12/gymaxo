import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { notificationService } from "../services/notification.service.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth); // Require authentication

notificationRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await notificationService.getNotifications(
      req.auth!.userId,
      Number(page),
      Number(limit),
    );
    res.json({ ok: true, data: { notifications } });
  }),
);

notificationRoutes.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const success = await notificationService.markAsRead(req.params.id, req.auth!.userId);
    if (!success) {
      return res.status(404).json({ ok: false, message: "Notification not found" });
    }
    res.json({ ok: true, data: { read: true } });
  }),
);

notificationRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const success = await notificationService.deleteNotification(req.params.id, req.auth!.userId);
    if (!success) {
      return res.status(404).json({ ok: false, message: "Notification not found" });
    }
    res.json({ ok: true, data: { deleted: true } });
  }),
);
