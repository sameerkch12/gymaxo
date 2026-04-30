import { CustomerModel } from "../models/customer.model.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { PaymentRequestModel } from "../models/payment-request.model.js";
import { UserModel } from "../models/user.model.js";
import { forbidden, notFound } from "../errors/AppError.js";
import { normalizePhone, phoneLooseRegex, phoneSearchValues } from "../utils/phone.js";

export async function assertCustomerAccessibleByUser(userId: string, customerId: string) {
  const [user, customer] = await Promise.all([
    UserModel.findById(userId),
    CustomerModel.findById(customerId),
  ]);

  if (!user) throw notFound("User not found");
  if (!customer) throw notFound("Membership not found");

  const linkedToUser = customer.userId && String(customer.userId) === userId;
  const unlinkedMatchingPhone =
    !customer.userId && normalizePhone(customer.phone) === normalizePhone(user.phone);

  if (!linkedToUser && !unlinkedMatchingPhone) {
    throw forbidden("This membership is not linked to your account");
  }

  return customer;
}

export async function getMyMembership(userId: string, phone?: string) {
  const phones = phone ? phoneSearchValues(phone) : [];
  const loosePhone = phone ? phoneLooseRegex(phone) : null;
  return CustomerModel.findOne({
    $or: [
      { userId },
      ...(phones.length ? [{ phone: { $in: phones } }] : []),
      ...(loosePhone ? [{ phone: { $regex: loosePhone } }] : []),
    ],
  })
    .populate("gymId")
    .populate("branchId")
    .populate("planId");
}

export async function linkCustomerMembershipToUser(userId: string, phone: string) {
  const phones = phoneSearchValues(phone);
  const loosePhone = phoneLooseRegex(phone);
  if (!phones.length) return null;

  return CustomerModel.findOneAndUpdate(
    {
      $or: [{ userId: { $exists: false } }, { userId: null }],
      ...(loosePhone ? { phone: { $regex: loosePhone } } : { phone: { $in: phones } }),
    },
    { userId },
    { new: true, sort: { createdAt: -1 } },
  );
}

export async function getCustomerHistory(userId: string, customerId: string) {
  const customer = await assertCustomerAccessibleByUser(userId, customerId);
  const [attendance, payments] = await Promise.all([
    AttendanceModel.find({ customerId: customer._id }).sort({ timestamp: -1 }),
    PaymentRequestModel.find({ customerId: customer._id }).sort({ createdAt: -1 }),
  ]);
  return { attendance, payments };
}
