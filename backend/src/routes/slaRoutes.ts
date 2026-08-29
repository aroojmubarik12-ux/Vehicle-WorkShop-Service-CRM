import { Router } from "express";
import { getSlas, createSla, updateSla, deleteSla } from "../controllers/slaController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getSlas);
router.post("/", checkRole("admin"), createSla);
router.put("/:id", checkRole("admin"), updateSla);
router.delete("/:id", checkRole("admin"), deleteSla);

export default router;
