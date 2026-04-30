import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { PLAN_DAYS } from "../constants/domain.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { BranchModel } from "../models/branch.model.js";
import { CustomerModel } from "../models/customer.model.js";
import { GymModel } from "../models/gym.model.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";
import { PaymentRequestModel } from "../models/payment-request.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { UserModel } from "../models/user.model.js";
import { addDays, dateOnly, timeHHmm } from "../utils/dates.js";
import { hashPassword } from "../utils/password.js";

async function clearDatabase() {
  await Promise.all([
    AttendanceModel.deleteMany({}),
    PaymentRequestModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    MembershipPlanModel.deleteMany({}),
    BranchModel.deleteMany({}),
    GymModel.deleteMany({}),
    SubscriptionModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

async function seed() {
  await connectDatabase();
  await clearDatabase();

  const [owner, member] = await UserModel.create([
    {
      name: "Alex Mercer",
      phone: "9999900001",
      email: "alex@gympro.app",
      role: "owner",
      passwordHash: await hashPassword("owner123"),
    },
    {
      name: "Jordan Reyes",
      phone: "9999900002",
      email: "jordan@gympro.app",
      role: "customer",
      passwordHash: await hashPassword("member123"),
    },
  ]);

  await SubscriptionModel.create({
    ownerId: owner._id,
    active: true,
    dueDate: addDays(dateOnly(new Date()), 2),
    monthlyFee: 99,
    lastPaidAt: new Date(),
  });

  const gym = await GymModel.create({
    ownerId: owner._id,
    name: "Iron Pulse Fitness",
    address: "Downtown HQ",
  });

  const [branchA, branchB] = await BranchModel.create([
    {
      ownerId: owner._id,
      gymId: gym._id,
      name: "Iron Pulse - Midtown",
      address: "221 Main Street",
      qrSecret: "demo-midtown-secret",
    },
    {
      ownerId: owner._id,
      gymId: gym._id,
      name: "Iron Pulse - Riverside",
      address: "47 River Road",
      qrSecret: "demo-riverside-secret",
    },
  ]);

  const [monthly, quarterly, yearly] = await MembershipPlanModel.create([
    {
      ownerId: owner._id,
      name: "Monthly Pulse",
      type: "monthly",
      durationDays: PLAN_DAYS.monthly,
      price: 999,
    },
    {
      ownerId: owner._id,
      name: "Quarterly Power",
      type: "quarterly",
      durationDays: PLAN_DAYS.quarterly,
      price: 2499,
    },
    {
      ownerId: owner._id,
      name: "Yearly Beast",
      type: "yearly",
      durationDays: PLAN_DAYS.yearly,
      price: 8999,
    },
  ]);

  const jordan = await CustomerModel.create({
    ownerId: owner._id,
    gymId: gym._id,
    branchId: branchA._id,
    userId: member._id,
    name: "Jordan Reyes",
    phone: "9999900002",
    planId: quarterly._id,
    startDate: addDays(new Date(), -87),
    endDate: addDays(new Date(), 3),
    active: true,
  });

  const sam = await CustomerModel.create({
    ownerId: owner._id,
    gymId: gym._id,
    branchId: branchA._id,
    name: "Sam Carter",
    phone: "9999900003",
    planId: monthly._id,
    startDate: addDays(new Date(), -20),
    endDate: addDays(new Date(), 10),
    active: true,
  });

  await CustomerModel.create([
    {
      ownerId: owner._id,
      gymId: gym._id,
      branchId: branchB._id,
      name: "Maya Singh",
      phone: "9999900004",
      planId: yearly._id,
      startDate: addDays(new Date(), -100),
      endDate: addDays(new Date(), 265),
      active: true,
    },
    {
      ownerId: owner._id,
      gymId: gym._id,
      branchId: branchB._id,
      name: "Chris Lin",
      phone: "9999900005",
      planId: monthly._id,
      startDate: addDays(new Date(), -45),
      endDate: addDays(new Date(), -2),
      active: false,
    },
  ]);

  const attendance = [];
  for (let i = 1; i <= 14; i += 1) {
    if (i % 3 === 0) continue;
    const day = dateOnly(addDays(new Date(), -i));
    attendance.push({
      customerId: jordan._id,
      gymId: gym._id,
      branchId: branchA._id,
      date: day,
      time: timeHHmm(day),
      timestamp: day,
    });
  }
  await AttendanceModel.insertMany(attendance);

  await PaymentRequestModel.create({
    customerId: sam._id,
    ownerId: owner._id,
    planId: monthly._id,
    amount: 999,
    screenshotUri: "https://example.com/demo-payment.png",
    status: "pending",
    note: "Payment via UPI",
  });

  console.log("Seed complete");
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
