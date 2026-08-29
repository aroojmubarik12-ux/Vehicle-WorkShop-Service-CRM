import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import customerRoutes from "./customerRoutes";
import vehicleRoutes from "./vehicleRoutes";
import jobCardRoutes from "./jobCardRoutes";
import followUpRoutes from "./followUpRoutes";
import feedbackRoutes from "./feedbackRoutes";
import dashboardRoutes from "./dashboardRoutes";
import reportRoutes from "./reportRoutes";
import slaRoutes from "./slaRoutes";
import serviceCategoryRoutes from "./serviceCategoryRoutes";
import notificationRoutes from "./notificationRoutes";
import activityLogRoutes from "./activityLogRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/jobcards", jobCardRoutes);
router.use("/followups", followUpRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/sla", slaRoutes);
router.use("/service-categories", serviceCategoryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/activity-logs", activityLogRoutes);

export default router;
