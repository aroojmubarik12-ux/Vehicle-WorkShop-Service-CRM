import { Request, Response } from "express";
import { JobCardMessage } from "../models/JobCardMessage";
import { JobCard } from "../models/JobCard";
import { logActivity } from "../services/activityLogService";
import { sendNotification } from "../services/notificationService";

export const getJobCardMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobCardId = req.params.id;
    const filter: any = { jobCard: jobCardId };

    // Strict Security Rule: Customers cannot view internal notes
    if (req.user?.role === "customer") {
      filter.type = { $ne: "internal_note" };
    }

    const messages = await JobCardMessage.find(filter)
      .populate("sender", "name email role specialization profilePicture")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobCardMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobCardId = req.params.id;
    const { message, type = "internal_note", attachments = [] } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: "Message content cannot be empty." });
      return;
    }

    const jobCard = await JobCard.findById(jobCardId).populate("customer assignedTo");
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    // If customer sends a message, enforce type = "customer_reply"
    let effectiveType = type;
    if (req.user?.role === "customer") {
      effectiveType = "customer_reply";
    }

    const newMessage = await JobCardMessage.create({
      jobCard: jobCard._id,
      sender: req.user?._id,
      senderRole: req.user?.role,
      message: message.trim(),
      type: effectiveType,
      attachments
    });

    // If this is the first response from a technician/admin, record firstResponseAt
    if (
      !jobCard.firstResponseAt &&
      ["admin", "technician"].includes(req.user?.role || "") &&
      effectiveType !== "internal_note"
    ) {
      jobCard.firstResponseAt = new Date();
      await jobCard.save();
    }

    // Log Activity
    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "MESSAGE_SENT",
      newValue: effectiveType,
      description: `${req.user?.name} added a ${effectiveType.replace(/_/g, " ")}: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`
    });

    // Notify appropriate parties
    if (req.user?.role === "customer") {
      if (jobCard.assignedTo) {
        await sendNotification({
          recipientId: (jobCard.assignedTo as any)._id,
          type: "reply",
          title: `Customer replied on ${jobCard.jobCardNumber}`,
          message: message.substring(0, 100),
          relatedJobCardId: jobCard._id
        });
      }
    } else if (effectiveType !== "internal_note") {
      const customer = jobCard.customer as any;
      if (customer && customer.userId) {
        await sendNotification({
          recipientId: customer.userId,
          type: "reply",
          title: `New message on ${jobCard.jobCardNumber}`,
          message: message.substring(0, 100),
          relatedJobCardId: jobCard._id
        });
      }
    }

    const populated = await JobCardMessage.findById(newMessage._id).populate(
      "sender",
      "name email role specialization profilePicture"
    );

    res.status(201).json({ success: true, message: "Message added successfully.", data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
