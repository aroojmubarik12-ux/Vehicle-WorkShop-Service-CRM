import { Router } from "express";
import { getJobCardsReport, getSlaReport, getTechniciansReport, getFeedbackReport } from "../controllers/reportController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);
router.use(checkRole("admin"));

router.get("/jobcards", getJobCardsReport);
router.get("/sla", getSlaReport);
router.get("/technicians", getTechniciansReport);
router.get("/feedback", getFeedbackReport);

export default router;
