import mongoose from "mongoose";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

interface INotificationOptions {
  recipientId?: mongoose.Types.ObjectId | string;
  recipientRole?: "admin" | "technician" | "customer";
  type:
    | "assignment"
    | "status_change"
    | "sla_breach"
    | "critical_job"
    | "escalation"
    | "feedback"
    | "reply"
    | "followup_due";
  title: string;
  message: string;
  relatedJobCardId?: mongoose.Types.ObjectId | string;
}

export const sendNotification = async (opts: INotificationOptions) => {
  try {
    if (opts.recipientId) {
      await Notification.create({
        recipient: opts.recipientId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        relatedJobCard: opts.relatedJobCardId
      });
    } else if (opts.recipientRole) {
      const users = await User.find({ role: opts.recipientRole, status: "active" });
      const notifications = users.map((u) => ({
        recipient: u._id,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        relatedJobCard: opts.relatedJobCardId
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  } catch (error) {
    console.error("[Notification Error]:", error);
  }
};
