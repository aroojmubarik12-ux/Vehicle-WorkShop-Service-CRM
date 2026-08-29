import { Router } from "express";
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory
} from "../controllers/serviceCategoryController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getServiceCategories);
router.post("/", checkRole("admin"), createServiceCategory);
router.put("/:id", checkRole("admin"), updateServiceCategory);
router.delete("/:id", checkRole("admin"), deleteServiceCategory);

export default router;
