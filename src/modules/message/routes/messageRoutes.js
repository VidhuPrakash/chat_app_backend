import express from "express";
import MessageController from "../controllers/messageController.js";
import authMiddleware from "../../auth/middleware/authMiddleware.js";

const router = express.Router();
const messageController = new MessageController();

// route for getting chat history
router.get("/:receiver", authMiddleware, (req, res) =>
  messageController.getChatHistory(req, res)
);
// route for marking a message as read
router.patch("/:messageId/read", authMiddleware, (req, res) =>
  messageController.markAsRead(req, res)
);
// route for getting group chat history
router.get("/group/:groupId", authMiddleware, (req, res) =>
  messageController.getGroupChatHistory(req, res)
);

export default router;
