import { Schema, model, type InferSchemaType, Types } from "mongoose";

const gymSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

export type GymDocument = InferSchemaType<typeof gymSchema> & { _id: Types.ObjectId };
export const GymModel = model("Gym", gymSchema);
