import { Request, Response } from "express";
import { Customer } from "../models/Customer";
import { Vehicle } from "../models/Vehicle";
import { JobCard } from "../models/JobCard";

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, city } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found." });
      return;
    }

    const vehicles = await Vehicle.find({ owner: customer._id });
    const jobCards = await JobCard.find({ customer: customer._id })
      .populate("vehicle")
      .populate("assignedTo", "name email phone specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer,
      vehicles,
      jobCards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, alternatePhone, city, address, company, tags, status } = req.body;
    if (!name || !email || !phone) {
      res.status(400).json({ success: false, message: "Name, email, and phone are required." });
      return;
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: "Customer with this email already exists." });
      return;
    }

    const customer = await Customer.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      alternatePhone,
      city,
      address,
      company,
      tags: tags || [],
      status: status || "active"
    });

    res.status(201).json({ success: true, message: "Customer created successfully.", customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, alternatePhone, city, address, company, tags, status } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, alternatePhone, city, address, company, tags, status },
      { new: true, runValidators: true }
    );
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Customer updated successfully.", customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
