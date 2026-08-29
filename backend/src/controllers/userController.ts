import { Request, Response } from "express";
import { User } from "../models/User";
import { JobCard } from "../models/JobCard";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, specialization, status } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already exists." });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: password || "password123",
      role: role || "technician",
      specialization: specialization || "General Service",
      status: status || "active"
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, message: "User created successfully.", user: userResponse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, specialization, status, role, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, specialization, status, role, profilePicture },
      { new: true, runValidators: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, message: "User updated.", user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const patchUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value." });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, message: `User status changed to ${status}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeJobs = await JobCard.countDocuments({
      assignedTo: req.params.id,
      status: { $nin: ["completed", "delivered"] }
    });
    if (activeJobs > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete technician with ${activeJobs} active job cards. Reassign them first or deactivate the user.`
      });
      return;
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
