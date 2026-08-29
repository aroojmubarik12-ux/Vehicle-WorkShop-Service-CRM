import { Request, Response } from "express";
import { JobCard } from "../models/JobCard";
import { User } from "../models/User";
import { Feedback } from "../models/Feedback";

export const getJobCardsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, serviceType, priority, status } = req.query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    if (serviceType) filter.serviceType = serviceType;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const [jobCards, statusStats, priorityStats, serviceTypeStats] = await Promise.all([
      JobCard.find(filter)
        .populate("customer", "name email phone city")
        .populate("vehicle", "make model year registrationNumber")
        .populate("assignedTo", "name specialization")
        .sort({ createdAt: -1 }),
      JobCard.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      JobCard.aggregate([{ $match: filter }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
      JobCard.aggregate([{ $match: filter }, { $group: { _id: "$serviceType", count: { $sum: 1 } } }])
    ]);

    res.status(200).json({
      success: true,
      total: jobCards.length,
      statusBreakdown: statusStats,
      priorityBreakdown: priorityStats,
      serviceTypeBreakdown: serviceTypeStats,
      jobCards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSlaReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const completedJobs = await JobCard.find({
      status: { $in: ["completed", "delivered"] },
      completedAt: { $exists: true }
    }).populate("assignedTo", "name");

    let metSlaCount = 0;
    let breachedSlaCount = 0;
    let totalTurnaroundHours = 0;
    let totalResponseHours = 0;
    let responseCount = 0;

    completedJobs.forEach((jc) => {
      const turnaround = (new Date(jc.completedAt!).getTime() - new Date(jc.createdAt).getTime()) / (1000 * 60 * 60);
      totalTurnaroundHours += turnaround;

      if (jc.slaDeadline) {
        if (new Date(jc.completedAt!) <= new Date(jc.slaDeadline)) {
          metSlaCount++;
        } else {
          breachedSlaCount++;
        }
      }

      if (jc.firstResponseAt) {
        const responseTime = (new Date(jc.firstResponseAt).getTime() - new Date(jc.createdAt).getTime()) / (1000 * 60 * 60);
        totalResponseHours += responseTime;
        responseCount++;
      }
    });

    const activeOverdue = await JobCard.countDocuments({
      status: { $nin: ["completed", "delivered"] },
      slaDeadline: { $lt: now }
    });

    const totalCalculated = metSlaCount + breachedSlaCount;
    const slaComplianceRate = totalCalculated > 0 ? Math.round((metSlaCount / totalCalculated) * 100) : 100;

    res.status(200).json({
      success: true,
      slaComplianceRate,
      metSlaCount,
      breachedSlaCount,
      activeOverdue,
      avgTurnaroundHours: completedJobs.length > 0 ? Number((totalTurnaroundHours / completedJobs.length).toFixed(1)) : 0,
      avgResponseHours: responseCount > 0 ? Number((totalResponseHours / responseCount).toFixed(1)) : 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTechniciansReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const technicians = await User.find({ role: "technician" }).select("name email phone specialization status");
    const now = new Date();

    const report = await Promise.all(
      technicians.map(async (tech) => {
        const [assigned, inProgress, completed, overdue, feedbacks] = await Promise.all([
          JobCard.countDocuments({ assignedTo: tech._id }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $in: ["assigned", "diagnosis", "in_progress", "waiting_for_parts"] } }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $in: ["completed", "delivered"] } }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $nin: ["completed", "delivered"] }, slaDeadline: { $lt: now } }),
          Feedback.find({ technician: tech._id }).select("rating")
        ]);

        const avgRating = feedbacks.length > 0 ? Number((feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(2)) : 5.0;

        return {
          id: tech._id,
          name: tech.name,
          email: tech.email,
          specialization: tech.specialization,
          status: tech.status,
          totalAssigned: assigned,
          inProgress,
          completed,
          overdue,
          rating: avgRating,
          totalReviews: feedbacks.length
        };
      })
    );

    res.status(200).json({ success: true, count: report.length, technicians: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedbackReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedbacks = await Feedback.find()
      .populate("customer", "name email phone")
      .populate("technician", "name specialization")
      .populate("jobCard", "jobCardNumber subject serviceType");

    const totalRatings = feedbacks.length;
    const avgRating = totalRatings > 0 ? Number((feedbacks.reduce((a, b) => a + b.rating, 0) / totalRatings).toFixed(2)) : 5.0;

    const ratingDistribution = {
      5: feedbacks.filter((f) => f.rating === 5).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      1: feedbacks.filter((f) => f.rating === 1).length
    };

    res.status(200).json({
      success: true,
      totalFeedback: totalRatings,
      averageRating: avgRating,
      ratingDistribution,
      feedbacks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
