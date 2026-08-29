import mongoose, { Document, Schema } from "mongoose";

export interface IServiceCategory extends Document {
  name: string;
  description: string;
  subServices: string[];
  estimatedHours: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    subServices: [{ type: String }],
    estimatedHours: { type: Number, default: 2 },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export const ServiceCategory = mongoose.model<IServiceCategory>("ServiceCategory", ServiceCategorySchema);
