import { Schema, model, type InferSchemaType, Types } from "mongoose";

const customerSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CustomerDocument = InferSchemaType<typeof customerSchema> & {
  _id: Types.ObjectId;
};

export const CustomerModel = model("Customer", customerSchema);
