import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type:
    | "assignment"
    | "status_change"
    | "sla_breach"
    | "critical_job"
    | "escalation"
    | "feedback"
    | "reply"
    | "followup_due";
  title: string;
  message: string;
  read: boolean;
  relatedJobCard?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "assignment",
        "status_change",
        "sla_breach",
        "critical_job",
        "escalation",
        "feedback",
        "reply",
        "followup_due"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedJobCard: { type: Schema.Types.ObjectId, ref: "JobCard" }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
