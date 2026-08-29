import mongoose, { Document, Schema } from "mongoose";

export interface IJobCardMessage extends Document {
  jobCard: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: "admin" | "technician" | "customer";
  message: string;
  type: "internal_note" | "customer_reply" | "email" | "phone" | "whatsapp" | "other";
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobCardMessageSchema = new Schema<IJobCardMessage>(
  {
    jobCard: { type: Schema.Types.ObjectId, ref: "JobCard", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["admin", "technician", "customer"], required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["internal_note", "customer_reply", "email", "phone", "whatsapp", "other"],
      default: "internal_note"
    },
    attachments: [{ type: String }]
  },
  { timestamps: true }
);

JobCardMessageSchema.index({ jobCard: 1, createdAt: 1 });

export const JobCardMessage = mongoose.model<IJobCardMessage>("JobCardMessage", JobCardMessageSchema);
