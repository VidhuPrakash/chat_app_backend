import express from "express";
import GroupController from "../controller/groupController.js";
import authMiddleware from "../../auth/middleware/authMiddleware.js";

const router = express.Router();
const groupsController = new GroupController();

// route for get all groups
router.get("/", authMiddleware, (req, res) =>
  groupsController.getGroups(req, res)
);

export default router;
