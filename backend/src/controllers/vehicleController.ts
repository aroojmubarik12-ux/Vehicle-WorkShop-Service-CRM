import { Request, Response } from "express";
import { Vehicle } from "../models/Vehicle";
import { Customer } from "../models/Customer";
import { JobCard } from "../models/JobCard";

export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, owner, make, fuelType } = req.query;
    const filter: any = {};
    if (owner) filter.owner = owner;
    if (make) filter.make = make;
    if (fuelType) filter.fuelType = fuelType;
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: "i" } },
        { chassisNumber: { $regex: search, $options: "i" } },
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } }
      ];
    }

    // Role-based filter for customers
    if (req.user?.role === "customer" && req.user.customerId) {
      filter.owner = req.user.customerId;
    }

    const vehicles = await Vehicle.find(filter).populate("owner", "name email phone").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("owner");
    if (!vehicle) {
      res.status(404).json({ success: false, message: "Vehicle not found." });
      return;
    }

    if (req.user?.role === "customer" && req.user.customerId) {
      if (vehicle.owner._id.toString() !== req.user.customerId.toString()) {
        res.status(403).json({ success: false, message: "Forbidden: Not your vehicle." });
        return;
      }
    }

    const serviceHistory = await JobCard.find({ vehicle: vehicle._id })
      .populate("assignedTo", "name email specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, vehicle, serviceHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    let { owner, make, model, year, registrationNumber, chassisNumber, fuelType, mileage, lastServiceDate } = req.body;

    if (req.user?.role === "customer") {
      if (!req.user.customerId) {
        // Find or create customer
        let cust = await Customer.findOne({ userId: req.user._id });
        if (!cust) {
          cust = await Customer.create({
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            userId: req.user._id,
            tags: ["Customer Portal"]
          });
        }
        owner = cust._id;
      } else {
        owner = req.user.customerId;
      }
    }

    if (!owner || !make || !model || !year || !registrationNumber || !chassisNumber) {
      res.status(400).json({
        success: false,
        message: "Owner, make, model, year, registrationNumber, and chassisNumber are required."
      });
      return;
    }

    const existingReg = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
    if (existingReg) {
      res.status(409).json({ success: false, message: "A vehicle with this registration number is already registered." });
      return;
    }

    const vehicle = await Vehicle.create({
      owner,
      make,
      model,
      year: Number(year),
      registrationNumber: registrationNumber.toUpperCase().trim(),
      chassisNumber: chassisNumber.toUpperCase().trim(),
      fuelType: fuelType || "Petrol",
      mileage: mileage ? Number(mileage) : 0,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined
    });

    const populated = await Vehicle.findById(vehicle._id).populate("owner", "name email phone");
    res.status(201).json({ success: true, message: "Vehicle registered successfully.", vehicle: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, year, registrationNumber, chassisNumber, fuelType, mileage, lastServiceDate } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        make,
        model,
        year: year ? Number(year) : undefined,
        registrationNumber: registrationNumber ? registrationNumber.toUpperCase().trim() : undefined,
        chassisNumber: chassisNumber ? chassisNumber.toUpperCase().trim() : undefined,
        fuelType,
        mileage: mileage !== undefined ? Number(mileage) : undefined,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined
      },
      { new: true, runValidators: true }
    ).populate("owner", "name email phone");

    if (!vehicle) {
      res.status(404).json({ success: false, message: "Vehicle not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Vehicle updated.", vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
