import { Request, Response } from "express";
import { SLA } from "../models/SLA";

export const getSlas = async (req: Request, res: Response): Promise<void> => {
  try {
    const slas = await SLA.find().sort({ priority: 1 });
    res.status(200).json({ success: true, count: slas.length, slas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSla = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority, serviceType = "all", responseTimeHours, turnaroundTimeHours, status } = req.body;
    if (!priority || !responseTimeHours || !turnaroundTimeHours) {
      res.status(400).json({ success: false, message: "Priority, response time, and turnaround time are required." });
      return;
    }

    const sla = await SLA.create({
      priority,
      serviceType,
      responseTimeHours: Number(responseTimeHours),
      turnaroundTimeHours: Number(turnaroundTimeHours),
      status: status || "active"
    });

    res.status(201).json({ success: true, message: "SLA rule created.", sla });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSla = async (req: Request, res: Response): Promise<void> => {
  try {
    const { responseTimeHours, turnaroundTimeHours, status, serviceType } = req.body;
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      {
        ...(responseTimeHours !== undefined && { responseTimeHours: Number(responseTimeHours) }),
        ...(turnaroundTimeHours !== undefined && { turnaroundTimeHours: Number(turnaroundTimeHours) }),
        ...(status && { status }),
        ...(serviceType && { serviceType })
      },
      { new: true }
    );
    if (!sla) {
      res.status(404).json({ success: false, message: "SLA rule not found." });
      return;
    }
    res.status(200).json({ success: true, message: "SLA updated.", sla });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSla = async (req: Request, res: Response): Promise<void> => {
  try {
    const sla = await SLA.findByIdAndDelete(req.params.id);
    if (!sla) {
      res.status(404).json({ success: false, message: "SLA rule not found." });
      return;
    }
    res.status(200).json({ success: true, message: "SLA deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
