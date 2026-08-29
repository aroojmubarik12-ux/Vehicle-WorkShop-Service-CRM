import { Request, Response } from "express";
import { ServiceCategory } from "../models/ServiceCategory";

export const getServiceCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const categories = await ServiceCategory.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, subServices, estimatedHours, status } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required." });
      return;
    }

    const category = await ServiceCategory.create({
      name: name.trim(),
      description: description || "",
      subServices: Array.isArray(subServices) ? subServices : typeof subServices === "string" ? subServices.split(",").map((s) => s.trim()) : [],
      estimatedHours: estimatedHours ? Number(estimatedHours) : 2,
      status: status || "active"
    });

    res.status(201).json({ success: true, message: "Service category created.", category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, subServices, estimatedHours, status } = req.body;
    const category = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        subServices: Array.isArray(subServices) ? subServices : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        status
      },
      { new: true }
    );
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Category updated.", category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServiceCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
