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
      Number(limit)
    );
    res.json(notifications);
  })
);

notificationRoutes.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const success = await notificationService.markAsRead(req.params.id, req.auth!.userId);
    if (!success) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read" });
  })
);

notificationRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const success = await notificationService.deleteNotification(req.params.id, req.auth!.userId);
    if (!success) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  })
);