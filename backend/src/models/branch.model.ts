import { Schema, model, type InferSchemaType, Types } from "mongoose";

const branchSchema = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    qrSecret: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export type BranchDocument = InferSchemaType<typeof branchSchema> & { _id: Types.ObjectId };
export const BranchModel = model("Branch", branchSchema);
