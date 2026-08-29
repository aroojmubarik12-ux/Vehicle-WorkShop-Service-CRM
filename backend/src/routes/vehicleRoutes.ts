import { Router } from "express";
import { getVehicles, getVehicleById, createVehicle, updateVehicle } from "../controllers/vehicleController";
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);

export default router;
