import { Router } from "express";
import {
  getJobCards,
  getJobCardById,
  createJobCard,
  updateStatus,
  assignJobCard,
  updatePriority,
  escalateJobCard,
  updatePartsAndLabor,
  updateCustomerApproval,
  uploadAttachment,
  deleteJobCard
} from "../controllers/jobCardController";
import { getJobCardMessages, createJobCardMessage } from "../controllers/messageController";
import { submitFeedback } from "../controllers/feedbackController";
import { authenticateUser, checkRole, checkJobCardAccess } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

router.use(authenticateUser);

router.get("/", getJobCards);
router.post("/", createJobCard);

router.get("/:id", checkJobCardAccess, getJobCardById);
router.delete("/:id", checkRole("admin"), deleteJobCard);

// Status, Assignment, Priority, Escalation
router.patch("/:id/status", checkJobCardAccess, updateStatus);
router.patch("/:id/assign", checkRole("admin"), assignJobCard);
router.patch("/:id/priority", checkRole("admin"), updatePriority);
router.post("/:id/escalate", checkJobCardAccess, escalateJobCard);

// Parts & Labor, Approval, Attachments
router.patch("/:id/parts-labor", checkRole("admin", "technician"), updatePartsAndLabor);
router.patch("/:id/approval", updateCustomerApproval);
router.post("/:id/attachments", checkJobCardAccess, upload.single("file"), uploadAttachment);

// Sub-routes for Messages & Feedback
router.get("/:id/messages", checkJobCardAccess, getJobCardMessages);
router.post("/:id/messages", checkJobCardAccess, createJobCardMessage);
router.post("/:id/feedback", submitFeedback);

export default router;
