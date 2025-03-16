import express from "express";
import authRoutes from "../modules/auth/routes/authRoute.js";
import messageRoutes from "../modules/message/routes/messageRoutes.js";
import usersRoutes from "../modules/user/routes/usersRouter.js";
import groupRoutes from "../modules/group/routes/groupRoute.js";

const router = express.Router();

router.get("/", (req, res) => res.send("Hello World!"));

// Register all routes here
router.use("/api/auth", authRoutes);
router.use("/api/messages", messageRoutes);
router.use("/api/users", usersRoutes);
router.use("/api/groups", groupRoutes);

export default router;
