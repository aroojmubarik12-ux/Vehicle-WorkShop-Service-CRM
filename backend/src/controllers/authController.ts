import { Request, Response } from "express";
import { User } from "../models/User";
import { Customer } from "../models/Customer";
import { generateToken } from "../utils/token";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    if (user.status !== "active") {
      res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact the administrator." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role = "customer", specialization, city, address } = req.body;
    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, message: "Name, email, phone, and password are required." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: "A user with this email already exists." });
      return;
    }

    let customerId = undefined;
    if (role === "customer") {
      const customer = await Customer.create({
        name,
        email: email.toLowerCase().trim(),
        phone,
        city: city || "",
        address: address || "",
        tags: ["Registered Online"],
        status: "active"
      });
      customerId = customer._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      role,
      specialization: role === "technician" ? specialization || "General Service" : undefined,
      customerId,
      status: "active"
    });

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, { userId: user._id });
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    const user = await User.findById(req.user._id).populate("customerId");
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
};
