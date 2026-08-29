import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  city: string;
  address: string;
  company?: string;
  tags: string[];
  status: "active" | "inactive";
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    company: { type: String, default: "" },
    tags: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    userId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
