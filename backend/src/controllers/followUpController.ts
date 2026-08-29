import { Request, Response } from "express";
import { FollowUp } from "../models/FollowUp";
import { JobCard } from "../models/JobCard";

export const getFollowUps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, jobCardId, assignedTo, view } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (jobCardId) filter.jobCard = jobCardId;

    if (req.user?.role === "technician") {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (view === "today") {
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (view === "upcoming") {
      filter.date = { $gt: endOfDay };
      filter.status = "pending";
    } else if (view === "overdue") {
      filter.date = { $lt: startOfDay };
      filter.status = "pending";
    }

    const followUps = await FollowUp.find(filter)
      .populate("assignedTo", "name email phone specialization")
      .populate({
        path: "jobCard",
        select: "jobCardNumber subject status priority customer vehicle",
        populate: [
          { path: "customer", select: "name phone email" },
          { path: "vehicle", select: "make model registrationNumber" }
        ]
      })
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: followUps.length, followUps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFollowUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobCard, assignedTo, date, time, type, notes, nextAction } = req.body;
    if (!jobCard || !date || !notes) {
      res.status(400).json({ success: false, message: "JobCard, date, and notes are required." });
      return;
    }

    const targetTechnician = req.user?.role === "technician" ? req.user._id : assignedTo || req.user?._id;

    const followUp = await FollowUp.create({
      jobCard,
      assignedTo: targetTechnician,
      date: new Date(date),
      time: time || "10:00 AM",
      type: type || "phone_call",
      status: "pending",
      notes,
      nextAction: nextAction || "",
      createdBy: req.user?._id
    });

    const populated = await FollowUp.findById(followUp._id)
      .populate("assignedTo", "name email")
      .populate("jobCard", "jobCardNumber subject");

    res.status(201).json({ success: true, message: "Follow-up scheduled.", followUp: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFollowUpStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes, nextAction } = req.body;
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(notes && { notes }),
        ...(nextAction && { nextAction })
      },
      { new: true }
    );
    if (!followUp) {
      res.status(404).json({ success: false, message: "Follow-up not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Follow-up updated.", followUp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
