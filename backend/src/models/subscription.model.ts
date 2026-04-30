import { Schema, model, type InferSchemaType, Types } from "mongoose";

const subscriptionSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    dueDate: { type: Date, required: true },
    monthlyFee: { type: Number, required: true },
    lastPaidAt: { type: Date },
  },
  { timestamps: true },
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & {
  _id: Types.ObjectId;
};

export const SubscriptionModel = model("Subscription", subscriptionSchema);
