import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  jobCard: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  technician?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  satisfactionStatus: "satisfied" | "neutral" | "unsatisfied";
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    jobCard: { type: Schema.Types.ObjectId, ref: "JobCard", required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    technician: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    satisfactionStatus: {
      type: String,
      enum: ["satisfied", "neutral", "unsatisfied"],
      default: "satisfied"
    }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", FeedbackSchema);
