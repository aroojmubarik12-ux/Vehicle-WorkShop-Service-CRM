import { Router } from "express";
import { getFollowUps, createFollowUp, updateFollowUpStatus } from "../controllers/followUpController";
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getFollowUps);
router.post("/", createFollowUp);
router.patch("/:id/status", updateFollowUpStatus);

export default router;
