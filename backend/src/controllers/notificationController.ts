import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user?._id })
      .populate("relatedJobCard", "jobCardNumber subject")
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipient: req.user?._id, read: false });

    res.status(200).json({ success: true, unreadCount, count: notifications.length, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user?._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Marked as read.", notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user?._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
