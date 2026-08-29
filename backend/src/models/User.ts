import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "admin" | "technician" | "customer";
  specialization?: string;
  status: "active" | "inactive";
  profilePicture?: string;
  customerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "technician", "customer"], default: "technician" },
    specialization: {
      type: String,
      enum: [
        "Engine Repair",
        "Electrical",
        "AC & Cooling",
        "Body & Paint",
        "Suspension & Brakes",
        "General Service",
        "Transmission",
        "Diagnostics",
        "Other"
      ],
      default: "General Service"
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    profilePicture: { type: String, default: "" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
