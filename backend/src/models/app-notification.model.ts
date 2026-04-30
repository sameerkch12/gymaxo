import { Schema, model, type InferSchemaType, Types } from "mongoose";

const appNotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

appNotificationSchema.index({ userId: 1, read: 1 });

export type AppNotificationDocument = InferSchemaType<typeof appNotificationSchema> & {
  _id: Types.ObjectId;
};

export const AppNotificationModel = model("AppNotification", appNotificationSchema);
