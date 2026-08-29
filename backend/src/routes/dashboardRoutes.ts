import { Router } from "express";
import { getAdminDashboard, getTechnicianDashboard, getCustomerDashboard } from "../controllers/dashboardController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/admin", checkRole("admin"), getAdminDashboard);
router.get("/technician", checkRole("admin", "technician"), getTechnicianDashboard);
router.get("/customer", getCustomerDashboard);

export default router;
