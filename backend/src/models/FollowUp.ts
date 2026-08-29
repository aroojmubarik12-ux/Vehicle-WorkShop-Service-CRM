import mongoose, { Document, Schema } from "mongoose";

export interface IFollowUp extends Document {
  jobCard: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  type: "phone_call" | "email" | "whatsapp" | "in_person" | "other";
  status: "pending" | "completed" | "missed" | "rescheduled";
  notes: string;
  nextAction?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    jobCard: { type: Schema.Types.ObjectId, ref: "JobCard", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    time: { type: String, default: "10:00 AM" },
    type: {
      type: String,
      enum: ["phone_call", "email", "whatsapp", "in_person", "other"],
      default: "phone_call"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed", "rescheduled"],
      default: "pending"
    },
    notes: { type: String, required: true },
    nextAction: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

FollowUpSchema.index({ assignedTo: 1, date: 1, status: 1 });

export const FollowUp = mongoose.model<IFollowUp>("FollowUp", FollowUpSchema);
