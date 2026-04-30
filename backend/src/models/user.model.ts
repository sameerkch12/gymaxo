import { Schema, model, type InferSchemaType } from "mongoose";
import { ROLES } from "../constants/domain.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    paymentUpiId: { type: String, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

userSchema.index({ phone: 1, role: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = model("User", userSchema);

export function toPublicUser(user: {
  _id: unknown;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  paymentUpiId?: string | null;
  createdAt?: Date;
  subscription?: unknown;
}) {
  return {
    id: String(user._id),
    name: user.name,
    phone: user.phone,
    email: user.email ?? null,
    role: user.role,
    paymentUpiId: user.paymentUpiId ?? "",
    createdAt: user.createdAt,
    subscription: user.subscription,
  };
}
