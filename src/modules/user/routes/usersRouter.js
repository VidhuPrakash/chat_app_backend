import express from "express";
import authMiddleware from "../../auth/middleware/authMiddleware.js";
import UsersController from "../controllers/usersController.js";

const router = express.Router();
const usersController = new UsersController();

// route for getting all users
router.get("/", authMiddleware, (req, res) =>
  usersController.getAllUsers(req, res)
);

export default router;
