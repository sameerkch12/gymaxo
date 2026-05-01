import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { BranchModel } from "../models/branch.model.js";
import { dateOnly, timeHHmm } from "../utils/dates.js";
import { assertCustomerAccessibleByUser } from "./customer.service.js";
import { getEventService } from "./event.service.js";
import { notificationService } from "./notification.service.js";

export async function markAttendance(input: {
  userId: string;
  customerId: string;
  gymId: string;
  branchId: string;
  secret: string;
}) {
  const customer = await assertCustomerAccessibleByUser(input.userId, input.customerId);
  if (!customer.active) throw new AppError(400, "Membership is inactive", "INACTIVE_MEMBERSHIP");
  if (String(customer.gymId) !== input.gymId || String(customer.branchId) !== input.branchId) {
    throw new AppError(400, "QR code does not match your assigned branch", "BRANCH_MISMATCH");
  }

  const branch = await BranchModel.findById(input.branchId);
  if (!branch || branch.qrSecret !== input.secret) {
    throw new AppError(400, "QR code is invalid or expired", "INVALID_QR");
  }

  const today = dateOnly(new Date(), env.APP_TIME_ZONE);
  const existing = await AttendanceModel.exists({ customerId: customer._id, date: today });
  if (existing) throw new AppError(409, "Attendance already marked today", "ALREADY_MARKED");

  const attendance = await AttendanceModel.create({
    customerId: customer._id,
    gymId: customer.gymId,
    branchId: customer.branchId,
    date: today,
    time: timeHHmm(new Date(), env.APP_TIME_ZONE),
    timestamp: new Date(),
  });

  const eventService = getEventService();
  eventService.emitToOwner(String(customer.ownerId), "attendance:marked", {
    attendance,
    customer,
  });

  await notificationService.createNotification(
    String(customer.ownerId),
    "Attendance Marked",
    `${customer.name} marked attendance for today.`,
  );

  return attendance;
}
