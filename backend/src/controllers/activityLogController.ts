import { Request, Response } from "express";
import { ActivityLog } from "../models/ActivityLog";

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobCardId, limit = 50 } = req.query;
    const filter: any = {};
    if (jobCardId) filter.jobCard = jobCardId;

    const logs = await ActivityLog.find(filter)
      .populate("user", "name email role specialization profilePicture")
      .populate("jobCard", "jobCardNumber subject")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
