import mongoose from "mongoose";
import { ActivityLog } from "../models/ActivityLog";

interface ILogOptions {
  userId?: mongoose.Types.ObjectId | string;
  jobCardId: mongoose.Types.ObjectId | string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export const logActivity = async (opts: ILogOptions) => {
  try {
    await ActivityLog.create({
      user: opts.userId,
      jobCard: opts.jobCardId,
      action: opts.action,
      oldValue: opts.oldValue || "",
      newValue: opts.newValue || "",
      description: opts.description
    });
  } catch (error) {
    console.error("[ActivityLog Error]:", error);
  }
};
