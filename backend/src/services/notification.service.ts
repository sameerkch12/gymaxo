import { AppNotificationModel, type AppNotificationDocument } from "../models/app-notification.model.js";
import { getEventService } from "./event.service.js";

export class NotificationService {
  async createNotification(userId: string, title: string, body: string): Promise<AppNotificationDocument> {
    const notification = await AppNotificationModel.create({
      userId,
      title,
      body,
    });

    // Emit real-time event
    const eventService = getEventService();
    eventService.emitToUser(userId, "notification:created", {
      id: notification._id,
      title,
      body,
      read: false,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20): Promise<AppNotificationDocument[]> {
    return AppNotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await AppNotificationModel.updateOne(
      { _id: notificationId, userId },
      { read: true }
    );
    return result.modifiedCount > 0;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await AppNotificationModel.deleteOne({ _id: notificationId, userId });
    return result.deletedCount > 0;
  }
}

export const notificationService = new NotificationService();