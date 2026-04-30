import { AppError } from "../errors/AppError.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { BranchModel } from "../models/branch.model.js";
import { dateOnly, timeHHmm } from "../utils/dates.js";
import { assertCustomerAccessibleByUser } from "./customer.service.js";

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

  const today = dateOnly(new Date());
  const existing = await AttendanceModel.exists({ customerId: customer._id, date: today });
  if (existing) throw new AppError(409, "Attendance already marked today", "ALREADY_MARKED");

  return AttendanceModel.create({
    customerId: customer._id,
    gymId: customer.gymId,
    branchId: customer.branchId,
    date: today,
    time: timeHHmm(),
    timestamp: new Date(),
  });
}
