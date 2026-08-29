import { Request, Response } from "express";
import mongoose from "mongoose";
import { JobCard } from "../models/JobCard";
import { User } from "../models/User";
import { Customer } from "../models/Customer";
import { Vehicle } from "../models/Vehicle";
import { Feedback } from "../models/Feedback";
import { FollowUp } from "../models/FollowUp";
import { ActivityLog } from "../models/ActivityLog";

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // Parallel metric counts
    const [
      totalJobs,
      openJobs,
      inProgressJobs,
      waitingPartsJobs,
      completedJobs,
      deliveredJobs,
      highCriticalJobs,
      overdueJobs,
      totalCustomers,
      totalVehicles,
      totalTechnicians,
      feedbacks,
      completedWithTime,
      recentActivity,
      recentJobCards
    ] = await Promise.all([
      JobCard.countDocuments(),
      JobCard.countDocuments({ status: { $in: ["open", "assigned"] } }),
      JobCard.countDocuments({ status: { $in: ["diagnosis", "in_progress"] } }),
      JobCard.countDocuments({ status: { $in: ["waiting_for_parts", "waiting_for_customer_approval"] } }),
      JobCard.countDocuments({ status: "completed" }),
      JobCard.countDocuments({ status: "delivered" }),
      JobCard.countDocuments({ priority: { $in: ["high", "critical"] }, status: { $nin: ["completed", "delivered"] } }),
      JobCard.countDocuments({ status: { $nin: ["completed", "delivered"] }, slaDeadline: { $lt: now } }),
      Customer.countDocuments({ status: "active" }),
      Vehicle.countDocuments(),
      User.countDocuments({ role: "technician", status: "active" }),
      Feedback.find().select("rating satisfactionStatus"),
      JobCard.find({ status: { $in: ["completed", "delivered"] }, completedAt: { $exists: true } }).select(
        "createdAt firstResponseAt completedAt deliveredAt"
      ),
      ActivityLog.find().populate("user", "name email role").populate("jobCard", "jobCardNumber subject").sort({ createdAt: -1 }).limit(10),
      JobCard.find().populate("customer", "name phone").populate("vehicle", "make model registrationNumber").populate("assignedTo", "name specialization").sort({ createdAt: -1 }).limit(8)
    ]);

    // Average Turnaround Time (in hours)
    let totalTurnaroundHours = 0;
    let totalResponseHours = 0;
    let countTurnaround = 0;
    let countResponse = 0;

    completedWithTime.forEach((jc) => {
      if (jc.completedAt && jc.createdAt) {
        const diffHours = (new Date(jc.completedAt).getTime() - new Date(jc.createdAt).getTime()) / (1000 * 60 * 60);
        totalTurnaroundHours += Math.max(0, diffHours);
        countTurnaround++;
      }
      if (jc.firstResponseAt && jc.createdAt) {
        const diffHours = (new Date(jc.firstResponseAt).getTime() - new Date(jc.createdAt).getTime()) / (1000 * 60 * 60);
        totalResponseHours += Math.max(0, diffHours);
        countResponse++;
      }
    });

    const avgTurnaroundTime = countTurnaround > 0 ? Number((totalTurnaroundHours / countTurnaround).toFixed(1)) : 0;
    const avgResponseTime = countResponse > 0 ? Number((totalResponseHours / countResponse).toFixed(1)) : 0;

    // Customer Satisfaction
    const totalRatings = feedbacks.length;
    const avgSatisfactionScore = totalRatings > 0 ? Number((feedbacks.reduce((a, b) => a + b.rating, 0) / totalRatings).toFixed(2)) : 5.0;
    const satisfiedCount = feedbacks.filter((f) => f.satisfactionStatus === "satisfied").length;
    const satisfactionPercentage = totalRatings > 0 ? Math.round((satisfiedCount / totalRatings) * 100) : 100;

    // Status Distribution
    const statusAgg = await JobCard.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const statusDistribution = statusAgg.map((s) => ({ status: s._id, count: s.count }));

    // Priority Distribution
    const priorityAgg = await JobCard.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const priorityDistribution = priorityAgg.map((p) => ({ priority: p._id, count: p.count }));

    // Service Type Breakdown
    const serviceTypeAgg = await JobCard.aggregate([
      { $group: { _id: "$serviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    const serviceTypeDistribution = serviceTypeAgg.map((st) => ({ serviceType: st._id, count: st.count }));

    // Technician Performance Table
    const technicians = await User.find({ role: "technician" }).select("name email specialization status");
    const techPerformance = await Promise.all(
      technicians.map(async (tech) => {
        const [assigned, open, completed, overdue, techFeedbacks] = await Promise.all([
          JobCard.countDocuments({ assignedTo: tech._id }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $nin: ["completed", "delivered"] } }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $in: ["completed", "delivered"] } }),
          JobCard.countDocuments({ assignedTo: tech._id, status: { $nin: ["completed", "delivered"] }, slaDeadline: { $lt: now } }),
          Feedback.find({ technician: tech._id }).select("rating")
        ]);

        const avgRating = techFeedbacks.length > 0 ? Number((techFeedbacks.reduce((a, b) => a + b.rating, 0) / techFeedbacks.length).toFixed(1)) : 5.0;

        return {
          id: tech._id,
          name: tech.name,
          email: tech.email,
          specialization: tech.specialization,
          status: tech.status,
          assignedJobs: assigned,
          openJobs: open,
          completedJobs: completed,
          overdueJobs: overdue,
          rating: avgRating
        };
      })
    );

    res.status(200).json({
      success: true,
      kpis: {
        totalJobs,
        openJobs,
        inProgressJobs,
        waitingPartsJobs,
        completedJobs,
        deliveredJobs,
        highCriticalJobs,
        overdueJobs,
        totalCustomers,
        totalVehicles,
        totalTechnicians,
        avgTurnaroundTime,
        avgResponseTime,
        avgSatisfactionScore,
        satisfactionPercentage
      },
      charts: {
        statusDistribution,
        priorityDistribution,
        serviceTypeDistribution
      },
      technicianPerformance: techPerformance,
      recentActivity,
      recentJobCards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTechnicianDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const techId = req.user?._id;
    const now = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalAssigned,
      openJobs,
      inProgressJobs,
      completedJobs,
      overdueJobs,
      todayFollowUps,
      myFeedbacks,
      activeJobCards
    ] = await Promise.all([
      JobCard.countDocuments({ assignedTo: techId }),
      JobCard.countDocuments({ assignedTo: techId, status: { $in: ["assigned", "diagnosis"] } }),
      JobCard.countDocuments({ assignedTo: techId, status: { $in: ["in_progress", "waiting_for_parts", "waiting_for_customer_approval"] } }),
      JobCard.countDocuments({ assignedTo: techId, status: { $in: ["completed", "delivered"] } }),
      JobCard.countDocuments({ assignedTo: techId, status: { $nin: ["completed", "delivered"] }, slaDeadline: { $lt: now } }),
      FollowUp.find({ assignedTo: techId, date: { $gte: startOfDay, $lte: endOfDay } }).populate({
        path: "jobCard",
        select: "jobCardNumber subject customer vehicle",
        populate: [
          { path: "customer", select: "name phone" },
          { path: "vehicle", select: "make model registrationNumber" }
        ]
      }),
      Feedback.find({ technician: techId }).select("rating comment satisfactionStatus createdAt"),
      JobCard.find({ assignedTo: techId, status: { $nin: ["completed", "delivered"] } })
        .populate("customer", "name phone city")
        .populate("vehicle", "make model registrationNumber")
        .sort({ priority: -1, slaDeadline: 1 })
        .limit(10)
    ]);

    const avgRating = myFeedbacks.length > 0 ? Number((myFeedbacks.reduce((a, b) => a + b.rating, 0) / myFeedbacks.length).toFixed(1)) : 5.0;

    res.status(200).json({
      success: true,
      kpis: {
        totalAssigned,
        openJobs,
        inProgressJobs,
        completedJobs,
        overdueJobs,
        averageRating: avgRating,
        totalReviews: myFeedbacks.length
      },
      todayFollowUps,
      activeJobCards,
      recentFeedbacks: myFeedbacks.slice(0, 5)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.customerId;
    const userId = req.user?._id;

    const filter: any = customerId ? { $or: [{ customer: customerId }, { createdBy: userId }] } : { createdBy: userId };

    const [
      activeServices,
      completedServices,
      totalVehicles,
      myVehicles,
      recentServices
    ] = await Promise.all([
      JobCard.countDocuments({ ...filter, status: { $nin: ["completed", "delivered"] } }),
      JobCard.countDocuments({ ...filter, status: { $in: ["completed", "delivered"] } }),
      Vehicle.countDocuments(customerId ? { owner: customerId } : { _id: null }),
      customerId ? Vehicle.find({ owner: customerId }).sort({ createdAt: -1 }) : [],
      JobCard.find(filter)
        .populate("vehicle", "make model registrationNumber year")
        .populate("assignedTo", "name specialization phone")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      kpis: {
        activeServices,
        completedServices,
        totalVehicles
      },
      myVehicles,
      recentServices
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
