import mongoose, { Schema } from "mongoose";

export interface IVehicle {
  _id?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";
  mileage: number;
  lastServiceDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    chassisNumber: { type: String, required: true, uppercase: true, trim: true },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"],
      default: "Petrol"
    },
    mileage: { type: Number, default: 0 },
    lastServiceDate: { type: Date }
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);