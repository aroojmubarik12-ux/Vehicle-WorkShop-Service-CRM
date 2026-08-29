import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  user?: mongoose.Types.ObjectId;
  jobCard: mongoose.Types.ObjectId;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    jobCard: { type: Schema.Types.ObjectId, ref: "JobCard", required: true },
    action: { type: String, required: true },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

ActivityLogSchema.index({ jobCard: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
