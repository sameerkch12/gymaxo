import { Schema, model, type InferSchemaType, Types } from "mongoose";
import { PLAN_TYPES } from "../constants/domain.js";

const membershipPlanSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, enum: PLAN_TYPES, required: true },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export type MembershipPlanDocument = InferSchemaType<typeof membershipPlanSchema> & {
  _id: Types.ObjectId;
};

export const MembershipPlanModel = model("MembershipPlan", membershipPlanSchema);
