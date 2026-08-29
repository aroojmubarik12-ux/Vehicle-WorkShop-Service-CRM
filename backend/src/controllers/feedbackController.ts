import { Request, Response } from "express";
import { Feedback } from "../models/Feedback";
import { JobCard } from "../models/JobCard";
import { logActivity } from "../services/activityLogService";
import { sendNotification } from "../services/notificationService";

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { technician, rating, satisfactionStatus } = req.query;
    const filter: any = {};
    if (rating) filter.rating = Number(rating);
    if (satisfactionStatus) filter.satisfactionStatus = satisfactionStatus;

    if (req.user?.role === "technician") {
      filter.technician = req.user._id;
    } else if (technician) {
      filter.technician = technician;
    }

    if (req.user?.role === "customer" && req.user.customerId) {
      filter.customer = req.user.customerId;
    }

    const feedbacks = await Feedback.find(filter)
      .populate("customer", "name email phone city")
      .populate("technician", "name email specialization")
      .populate("jobCard", "jobCardNumber subject serviceType completedAt")
      .sort({ createdAt: -1 });

    const totalRatings = feedbacks.length;
    const avgRating = totalRatings > 0 ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalRatings : 0;

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      averageRating: Number(avgRating.toFixed(2)),
      feedbacks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobCardId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      return;
    }

    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const existingFeedback = await Feedback.findOne({ jobCard: jobCard._id });
    if (existingFeedback) {
      res.status(409).json({ success: false, message: "Feedback already submitted for this job card." });
      return;
    }

    let satisfactionStatus: "satisfied" | "neutral" | "unsatisfied" = "satisfied";
    if (rating <= 2) satisfactionStatus = "unsatisfied";
    else if (rating === 3) satisfactionStatus = "neutral";

    const feedback = await Feedback.create({
      jobCard: jobCard._id,
      customer: jobCard.customer,
      technician: jobCard.assignedTo,
      rating: Number(rating),
      comment: comment || "",
      satisfactionStatus
    });

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "FEEDBACK_SUBMITTED",
      newValue: `${rating} Stars`,
      description: `Customer submitted feedback: ${rating}/5 Stars ("${comment || "No comment"}")`
    });

    if (satisfactionStatus === "unsatisfied") {
      await sendNotification({
        recipientRole: "admin",
        type: "feedback",
        title: `Low Rating Alert (${rating}/5)`,
        message: `Customer gave ${rating} stars on ${jobCard.jobCardNumber}: "${comment}"`,
        relatedJobCardId: jobCard._id
      });
    }

    res.status(201).json({ success: true, message: "Thank you for your feedback!", feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
