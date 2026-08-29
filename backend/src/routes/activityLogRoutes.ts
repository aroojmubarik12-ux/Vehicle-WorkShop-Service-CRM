import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLogController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", checkRole("admin", "technician"), getActivityLogs);

export default router;
