import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { User, IUser } from "../models/User";
import { JobCard } from "../models/JobCard";

interface DecodedToken {
  id: string;
  email: string;
  role: "admin" | "technician" | "customer";
  name: string;
  customerId?: string;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as DecodedToken;

    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      res.status(401).json({ success: false, message: "Invalid or inactive account." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const checkRole = (...roles: Array<"admin" | "technician" | "customer">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action."
      });
      return;
    }
    next();
  };
};

export const checkJobCardAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const jobCardId = req.params.id || req.params.jobCardId || req.body.jobCardId;
    if (!jobCardId) {
      return next();
    }

    // Admin has universal access
    if (user.role === "admin") {
      return next();
    }

    const jobCard = await JobCard.findById(jobCardId).populate("customer");
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    if (user.role === "technician") {
      if (!jobCard.assignedTo || jobCard.assignedTo.toString() !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "Forbidden: You can only access job cards assigned to you."
        });
        return;
      }
    }

    if (user.role === "customer") {
      const isCreator = jobCard.createdBy && jobCard.createdBy.toString() === user._id.toString();
      const isCustomerOwner =
        user.customerId &&
        jobCard.customer &&
        (jobCard.customer._id ? jobCard.customer._id.toString() : jobCard.customer.toString()) ===
          user.customerId.toString();

      if (!isCreator && !isCustomerOwner) {
        res.status(403).json({
          success: false,
          message: "Forbidden: You can only access your own vehicle job cards."
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying access permissions." });
  }
};
