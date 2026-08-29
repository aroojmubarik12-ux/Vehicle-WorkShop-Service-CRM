import { Router } from "express";
import { getFeedbacks } from "../controllers/feedbackController";
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getFeedbacks);

export default router;
