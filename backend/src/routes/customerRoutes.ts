import { Router } from "express";
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from "../controllers/customerController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", checkRole("admin", "technician"), getCustomers);
router.get("/:id", getCustomerById);
router.post("/", checkRole("admin", "technician"), createCustomer);
router.put("/:id", checkRole("admin", "technician"), updateCustomer);

export default router;
