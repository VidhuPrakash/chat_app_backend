import Message from "../models/message.js";

export default class MessageRepository {
  /**
   * Retrieves chat history between two users
   * @param {string} userId - The first user's id
   * @param {string} receiverId - The second user's id
   * @return {Promise<Message[]>} - Array of messages in order of oldest to newest
   */
  async getChatHistory(userId, receiverId) {
    return await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
  }

  /**
   * Marks a message as read by updating the message with the given id
   * @param {string} messageId - The id of the message to be marked as read
   * @return {Promise<Message>} - The updated message
   */
  async markAsRead(messageId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );
  }
}
