import { Schema, model, type InferSchemaType, Types } from "mongoose";
import { PAYMENT_STATUSES } from "../constants/domain.js";

const paymentRequestSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    amount: { type: Number, required: true, min: 1 },
    screenshotUri: { type: String },
    utrNumber: { type: String, trim: true, maxlength: 100 },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
    note: { type: String, maxlength: 500 },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

paymentRequestSchema.index({ ownerId: 1, status: 1 });

export type PaymentRequestDocument = InferSchemaType<typeof paymentRequestSchema> & {
  _id: Types.ObjectId;
};

export const PaymentRequestModel = model("PaymentRequest", paymentRequestSchema);
