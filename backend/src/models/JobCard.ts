import mongoose, { Document, Schema } from "mongoose";

export interface IPartUsed {
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IAttachment {
  url: string;
  filename: string;
  fileType: string;
  uploadedBy?: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface IJobCard extends Document {
  jobCardNumber: string;
  customer: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  serviceType: string;
  subService?: string;
  priority: "low" | "medium" | "high" | "critical";
  status:
    | "open"
    | "assigned"
    | "diagnosis"
    | "in_progress"
    | "waiting_for_parts"
    | "waiting_for_customer_approval"
    | "completed"
    | "delivered"
    | "reopened";
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  source:
    | "website"
    | "mobile_app"
    | "whatsapp"
    | "phone_call"
    | "walk_in"
    | "email"
    | "social_media"
    | "other";
  attachments: IAttachment[];
  slaDeadline?: Date;
  slaBreached: boolean;
  firstResponseAt?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
  diagnosisNotes?: string;
  resolutionNotes?: string;
  partsUsed: IPartUsed[];
  laborCharges: number;
  totalCost: number;
  customerApprovalStatus: "pending" | "approved" | "rejected";
  isEscalated: boolean;
  escalatedAt?: Date;
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobCardSchema = new Schema<IJobCard>(
  {
    jobCardNumber: { type: String, required: true, unique: true, uppercase: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    serviceType: { type: String, required: true },
    subService: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "diagnosis",
        "in_progress",
        "waiting_for_parts",
        "waiting_for_customer_approval",
        "completed",
        "delivered",
        "reopened"
      ],
      default: "open"
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: {
      type: String,
      enum: ["website", "mobile_app", "whatsapp", "phone_call", "walk_in", "email", "social_media", "other"],
      default: "walk_in"
    },
    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        fileType: { type: String, default: "image/jpeg" },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    slaDeadline: { type: Date },
    slaBreached: { type: Boolean, default: false },
    firstResponseAt: { type: Date },
    completedAt: { type: Date },
    deliveredAt: { type: Date },
    diagnosisNotes: { type: String, default: "" },
    resolutionNotes: { type: String, default: "" },
    partsUsed: [
      {
        name: { type: String, required: true },
        partNumber: { type: String, default: "" },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 }
      }
    ],
    laborCharges: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    customerApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    escalationReason: { type: String, default: "" }
  },
  { timestamps: true }
);

JobCardSchema.index({ jobCardNumber: 1 });
JobCardSchema.index({ customer: 1 });
JobCardSchema.index({ vehicle: 1 });
JobCardSchema.index({ assignedTo: 1 });
JobCardSchema.index({ status: 1 });
JobCardSchema.index({ priority: 1 });
JobCardSchema.index({ createdAt: -1 });
JobCardSchema.index({ slaDeadline: 1 });

export const JobCard = mongoose.model<IJobCard>("JobCard", JobCardSchema);
