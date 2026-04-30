import { Schema, model, type InferSchemaType, Types } from "mongoose";

const attendanceSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

attendanceSchema.index({ customerId: 1, date: 1 }, { unique: true });

export type AttendanceDocument = InferSchemaType<typeof attendanceSchema> & {
  _id: Types.ObjectId;
};

export const AttendanceModel = model("Attendance", attendanceSchema);
