import { Schema, model, type InferSchemaType, Types } from "mongoose";
import { ACCOUNT_ROLES } from "../constants/domain.js";

const emailOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ACCOUNT_ROLES, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailOtpSchema.index({ email: 1, role: 1, consumed: 1, createdAt: -1 });

export type EmailOtpDocument = InferSchemaType<typeof emailOtpSchema> & {
  _id: Types.ObjectId;
};

export const EmailOtpModel = model("EmailOtp", emailOtpSchema);
