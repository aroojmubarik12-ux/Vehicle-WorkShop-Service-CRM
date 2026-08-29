import mongoose, { Document, Schema } from "mongoose";

export interface ISLA extends Document {
  priority: "low" | "medium" | "high" | "critical";
  serviceType: string;
  responseTimeHours: number;
  turnaroundTimeHours: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const SLASchema = new Schema<ISLA>(
  {
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true
    },
    serviceType: { type: String, default: "all" },
    responseTimeHours: { type: Number, required: true },
    turnaroundTimeHours: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export const SLA = mongoose.model<ISLA>("SLA", SLASchema);
