import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../controllers/notificationController";
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

export default router;
