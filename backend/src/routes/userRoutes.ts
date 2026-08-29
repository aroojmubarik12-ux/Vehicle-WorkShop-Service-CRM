import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, patchUserStatus, deleteUser } from "../controllers/userController";
import { authenticateUser, checkRole } from "../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", checkRole("admin", "technician"), getUsers);
router.get("/:id", getUserById);
router.post("/", checkRole("admin"), createUser);
router.put("/:id", checkRole("admin"), updateUser);
router.patch("/:id/status", checkRole("admin"), patchUserStatus);
router.delete("/:id", checkRole("admin"), deleteUser);

export default router;
