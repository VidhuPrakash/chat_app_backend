import UserRepository from "../../auth/repositories/userRepository.js";
import GroupRepository from "../../group/repositories/groupRepository.js";
import MessageRepository from "../repositories/messageRepository.js";

const messageRepo = new MessageRepository();
const groupRepo = new GroupRepository();
const userRepo = new UserRepository();

export default class MessageController {
  /**
   * Retrieves chat history between the authenticated user and the receiver
   * provided as a route parameter. If successful, returns a JSON response
   * with the chat history data. If an error occurs, returns a JSON response
   * with an error message.
   *
   * @param {Object} req - The request object containing parameters and data
   * @param {Object} res - The response object used to send back the HTTP response
   * @returns {Promise<void>}
   */
  async getChatHistory(req, res) {
    try {
      const { receiver } = req.params;
      const messages = await messageRepo.getChatHistory(req.user.id, receiver);

      return res.status(200).json({
        status: true,
        message: "Chat history fetched successfully",
        data: messages,
        error: null,
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Failed to fetch chat history",
        data: null,
        error: error.message || error,
      });
    }
  }

  /**
   * Marks a specific message as read based on the message ID provided
   * in the request parameters. If successful, returns a JSON response
   * with the updated message data. If an error occurs, returns a JSON
   * response with an error message.
   *
   * @param {Object} req - The request object containing parameters and data
   * @param {Object} res - The response object used to send back the HTTP response
   * @returns {Promise<void>}
   */
  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const updatedMessage = await messageRepo.markAsRead(messageId);

      return res.status(200).json({
        status: true,
        message: "Message marked as read",
        data: updatedMessage,
        error: null,
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Failed to mark message as read",
        data: null,
        error: error.message || error,
      });
    }
  }
  /**
   * Retrieves the chat history of a specific group and returns it as a JSON response.
   * If successful, returns a JSON response with the chat history data, including the
   * sender usernames. If an error occurs, returns a JSON response with an error message.
   *
   * @param {Object} req - The request object containing parameters and data
   * @param {Object} res - The response object used to send back the HTTP response
   * @returns {Promise<void>}
   */
  async getGroupChatHistory(req, res) {
    try {
      const { groupId } = req.params;
      const messages = await groupRepo.findMessagesByGroupId(groupId);
      // Fetch sender usernames
      const senderIds = [...new Set(messages.map((msg) => msg.sender))];
      const users = await userRepo.findUserNameBySenderId(senderIds);
      const userMap = new Map(
        users.map((user) => [user._id.toString(), user.username])
      );

      const enrichedMessages = messages.map((msg) => ({
        ...msg,
        senderUsername: userMap.get(msg.sender) || "Unknown",
      }));

      return res.status(200).json({
        status: 200,
        message: "Group chat history fetched successfully",
        data: enrichedMessages,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch group chat history",
        data: null,
        error: error.message,
      });
    }
  }
}
