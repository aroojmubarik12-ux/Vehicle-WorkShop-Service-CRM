import { Request, Response } from "express";
import mongoose from "express";
import { JobCard, IJobCard } from "../models/JobCard";
import { Customer } from "../models/Customer";
import { Vehicle } from "../models/Vehicle";
import { User } from "../models/User";
import { calculateSlaDeadline } from "../services/slaService";
import { logActivity } from "../services/activityLogService";
import { sendNotification } from "../services/notificationService";

export const getJobCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      serviceType,
      assignedTo,
      customer,
      vehicle,
      isEscalated,
      overdue,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query: any = {};

    // RBAC filtering
    if (req.user?.role === "technician") {
      query.assignedTo = req.user._id;
    } else if (req.user?.role === "customer") {
      if (req.user.customerId) {
        query.$or = [{ customer: req.user.customerId }, { createdBy: req.user._id }];
      } else {
        query.createdBy = req.user._id;
      }
    } else {
      if (assignedTo) query.assignedTo = assignedTo;
      if (customer) query.customer = customer;
    }

    if (vehicle) query.vehicle = vehicle;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (serviceType) query.serviceType = serviceType;
    if (isEscalated !== undefined) query.isEscalated = isEscalated === "true";

    if (overdue === "true") {
      query.status = { $nin: ["completed", "delivered"] };
      query.slaDeadline = { $lt: new Date() };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const matchedCustomers = await Customer.find({ name: searchRegex }).select("_id");
      const matchedVehicles = await Vehicle.find({
        $or: [{ registrationNumber: searchRegex }, { make: searchRegex }, { model: searchRegex }]
      }).select("_id");

      query.$or = [
        { jobCardNumber: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { customer: { $in: matchedCustomers.map((c) => c._id) } },
        { vehicle: { $in: matchedVehicles.map((v) => v._id) } }
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [jobCards, total] = await Promise.all([
      JobCard.find(query)
        .populate("customer", "name email phone city")
        .populate("vehicle", "make model year registrationNumber fuelType")
        .populate("assignedTo", "name email specialization phone status")
        .populate("createdBy", "name email role")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      JobCard.countDocuments(query)
    ]);

    // Check SLA breach dynamically
    const now = new Date();
    const processedJobCards = jobCards.map((jc) => {
      const isBreached =
        !["completed", "delivered"].includes(jc.status) && jc.slaDeadline ? now > new Date(jc.slaDeadline) : false;
      return {
        ...jc.toObject(),
        slaBreached: isBreached
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      jobCards: processedJobCards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate("customer")
      .populate("vehicle")
      .populate("assignedTo", "name email phone specialization status profilePicture")
      .populate("createdBy", "name email role");

    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const now = new Date();
    const slaBreached =
      !["completed", "delivered"].includes(jobCard.status) && jobCard.slaDeadline
        ? now > new Date(jobCard.slaDeadline)
        : false;

    res.status(200).json({
      success: true,
      jobCard: {
        ...jobCard.toObject(),
        slaBreached
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobCard = async (req: Request, res: Response): Promise<void> => {
  try {
    let {
      customer,
      vehicle,
      subject,
      description,
      serviceType,
      subService,
      priority = "medium",
      assignedTo,
      source = "walk_in",
      attachments = []
    } = req.body;

    if (req.user?.role === "customer") {
      source = "website";
      if (req.user.customerId) {
        customer = req.user.customerId;
      } else {
        let cust = await Customer.findOne({ userId: req.user._id });
        if (!cust) {
          cust = await Customer.create({
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            userId: req.user._id
          });
        }
        customer = cust._id;
      }
    }

    if (!customer || !vehicle || !subject || !description || !serviceType) {
      res.status(400).json({
        success: false,
        message: "Customer, vehicle, subject, description, and serviceType are required."
      });
      return;
    }

    // Generate unique Job Card number JC-YYYY-XXXXX
    const year = new Date().getFullYear();
    const count = await JobCard.countDocuments();
    const jobCardNumber = `JC-${year}-${String(count + 1).padStart(4, "0")}`;

    // SLA calculation
    const { deadline } = await calculateSlaDeadline(priority, serviceType);

    // Initial status
    const initialStatus = assignedTo ? "assigned" : "open";

    const jobCard = await JobCard.create({
      jobCardNumber,
      customer,
      vehicle,
      subject,
      description,
      serviceType,
      subService,
      priority,
      status: initialStatus,
      assignedTo: assignedTo || undefined,
      createdBy: req.user?._id,
      source,
      attachments,
      slaDeadline: deadline
    });

    // Activity Log
    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "JOB_CARD_CREATED",
      newValue: initialStatus,
      description: `Job card ${jobCardNumber} created with priority ${priority.toUpperCase()}`
    });

    // Notify assigned technician if assigned
    if (assignedTo) {
      await sendNotification({
        recipientId: assignedTo,
        type: "assignment",
        title: "New Job Card Assigned",
        message: `You have been assigned to Job Card ${jobCardNumber}: "${subject}"`,
        relatedJobCardId: jobCard._id
      });
    }

    // Critical Priority notification to Admins
    if (priority === "critical") {
      await sendNotification({
        recipientRole: "admin",
        type: "critical_job",
        title: "CRITICAL Priority Job Card Created",
        message: `Critical Job Card ${jobCardNumber} requires immediate attention.`,
        relatedJobCardId: jobCard._id
      });
    }

    const populated = await JobCard.findById(jobCard._id)
      .populate("customer")
      .populate("vehicle")
      .populate("assignedTo", "name email phone specialization");

    res.status(201).json({
      success: true,
      message: `Job Card ${jobCardNumber} created successfully.`,
      jobCard: populated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, resolutionNotes, diagnosisNotes } = req.body;
    const validStatuses = [
      "open",
      "assigned",
      "diagnosis",
      "in_progress",
      "waiting_for_parts",
      "waiting_for_customer_approval",
      "completed",
      "delivered",
      "reopened"
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const jobCard = await JobCard.findById(req.params.id).populate("customer vehicle assignedTo");
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const oldStatus = jobCard.status;
    jobCard.status = status;

    if (resolutionNotes) jobCard.resolutionNotes = resolutionNotes;
    if (diagnosisNotes) jobCard.diagnosisNotes = diagnosisNotes;

    // Track timestamps
    if (!jobCard.firstResponseAt && ["diagnosis", "in_progress"].includes(status)) {
      jobCard.firstResponseAt = new Date();
    }

    if (status === "completed" && !jobCard.completedAt) {
      jobCard.completedAt = new Date();
      // Update vehicle last service date
      if (jobCard.vehicle) {
        await Vehicle.findByIdAndUpdate(jobCard.vehicle._id, { lastServiceDate: new Date() });
      }
    }

    if (status === "delivered" && !jobCard.deliveredAt) {
      jobCard.deliveredAt = new Date();
    }

    await jobCard.save();

    // Log Activity
    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "STATUS_CHANGED",
      oldValue: oldStatus,
      newValue: status,
      description: `Status changed from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`
    });

    // Notify Customer if customer user exists
    const customer = jobCard.customer as any;
    if (customer && customer.userId) {
      await sendNotification({
        recipientId: customer.userId,
        type: "status_change",
        title: `Job Card Update: ${jobCard.jobCardNumber}`,
        message: `Your vehicle service status has been updated to: ${status.replace(/_/g, " ").toUpperCase()}`,
        relatedJobCardId: jobCard._id
      });
    }

    res.status(200).json({ success: true, message: `Status updated to ${status}.`, jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignJobCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignedTo } = req.body;
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const tech = await User.findById(assignedTo);
    if (!tech || tech.role !== "technician" || tech.status !== "active") {
      res.status(400).json({ success: false, message: "Please select an active technician." });
      return;
    }

    const oldTechId = jobCard.assignedTo;
    jobCard.assignedTo = tech._id as any;
    if (jobCard.status === "open") {
      jobCard.status = "assigned";
    }

    await jobCard.save();

    const isReassignment = oldTechId && oldTechId.toString() !== tech._id.toString();
    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: isReassignment ? "REASSIGNED" : "ASSIGNED",
      oldValue: oldTechId ? oldTechId.toString() : "None",
      newValue: tech.name,
      description: `Job card ${isReassignment ? "reassigned" : "assigned"} to ${tech.name} (${tech.specialization})`
    });

    await sendNotification({
      recipientId: tech._id,
      type: "assignment",
      title: isReassignment ? "Job Card Reassigned to You" : "New Job Card Assigned",
      message: `You are assigned to ${jobCard.jobCardNumber}: "${jobCard.subject}"`,
      relatedJobCardId: jobCard._id
    });

    const populated = await JobCard.findById(jobCard._id)
      .populate("customer")
      .populate("vehicle")
      .populate("assignedTo", "name email phone specialization");

    res.status(200).json({ success: true, message: `Assigned to ${tech.name}.`, jobCard: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority } = req.body;
    if (!["low", "medium", "high", "critical"].includes(priority)) {
      res.status(400).json({ success: false, message: "Invalid priority." });
      return;
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const oldPriority = jobCard.priority;
    jobCard.priority = priority;

    // Recalculate SLA
    const { deadline } = await calculateSlaDeadline(priority, jobCard.serviceType);
    jobCard.slaDeadline = deadline;
    await jobCard.save();

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "PRIORITY_CHANGED",
      oldValue: oldPriority,
      newValue: priority,
      description: `Priority updated from ${oldPriority.toUpperCase()} to ${priority.toUpperCase()}`
    });

    res.status(200).json({ success: true, message: `Priority updated to ${priority}.`, jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const escalateJobCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    jobCard.isEscalated = true;
    jobCard.escalatedAt = new Date();
    jobCard.escalationReason = reason || "Escalated by staff";
    jobCard.priority = "critical";
    await jobCard.save();

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "ESCALATED",
      newValue: "Critical",
      description: `Job card escalated: "${reason || "Manual escalation"}"`
    });

    await sendNotification({
      recipientRole: "admin",
      type: "escalation",
      title: `Job Card Escalated: ${jobCard.jobCardNumber}`,
      message: `Reason: ${reason || "Action required"}`,
      relatedJobCardId: jobCard._id
    });

    res.status(200).json({ success: true, message: "Job card escalated successfully.", jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartsAndLabor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { partsUsed = [], laborCharges = 0, diagnosisNotes, resolutionNotes } = req.body;
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    let partsTotal = 0;
    const processedParts = partsUsed.map((p: any) => {
      const qty = Number(p.quantity) || 1;
      const price = Number(p.unitPrice) || 0;
      const total = qty * price;
      partsTotal += total;
      return {
        name: p.name,
        partNumber: p.partNumber || "",
        quantity: qty,
        unitPrice: price,
        total
      };
    });

    jobCard.partsUsed = processedParts;
    jobCard.laborCharges = Number(laborCharges) || 0;
    jobCard.totalCost = partsTotal + jobCard.laborCharges;
    if (diagnosisNotes !== undefined) jobCard.diagnosisNotes = diagnosisNotes;
    if (resolutionNotes !== undefined) jobCard.resolutionNotes = resolutionNotes;

    await jobCard.save();

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "COST_ESTIMATE_UPDATED",
      description: `Updated parts & labor. Total estimate: $${jobCard.totalCost}`
    });

    res.status(200).json({ success: true, message: "Parts & labor updated.", jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ success: false, message: "Status must be approved or rejected." });
      return;
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    jobCard.customerApprovalStatus = status;
    if (status === "approved" && jobCard.status === "waiting_for_customer_approval") {
      jobCard.status = "in_progress";
    }

    await jobCard.save();

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "CUSTOMER_APPROVAL",
      newValue: status,
      description: `Customer ${status} the repair cost estimate of $${jobCard.totalCost}`
    });

    if (jobCard.assignedTo) {
      await sendNotification({
        recipientId: jobCard.assignedTo,
        type: "status_change",
        title: `Customer ${status.toUpperCase()} Estimate`,
        message: `Estimate for ${jobCard.jobCardNumber} was ${status} by customer.`,
        relatedJobCardId: jobCard._id
      });
    }

    res.status(200).json({ success: true, message: `Estimate ${status}.`, jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded." });
      return;
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      url: fileUrl,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedBy: req.user?._id,
      uploadedAt: new Date()
    };

    jobCard.attachments.push(attachment as any);
    await jobCard.save();

    await logActivity({
      userId: req.user?._id,
      jobCardId: jobCard._id,
      action: "ATTACHMENT_UPLOADED",
      description: `Uploaded file: ${req.file.originalname}`
    });

    res.status(200).json({ success: true, message: "Attachment uploaded successfully.", attachment, jobCard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJobCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobCard = await JobCard.findByIdAndDelete(req.params.id);
    if (!jobCard) {
      res.status(404).json({ success: false, message: "Job card not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Job card deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
