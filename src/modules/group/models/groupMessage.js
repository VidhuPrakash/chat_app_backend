import mongoose from "mongoose";
/**
 * GroupMessage schema
 * @typedef GroupMessage
 * @property {string} sender - The ID of the user who sent the message.
 * @property {ObjectId} group - The ID of the group to which the message belongs.
 * @property {string} message - The content of the message.
 * @property {Array} readBy - An array of user IDs who have read the message.
 * @property {Date} createdAt - The timestamp when the message was created.
 */
const groupMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  message: { type: String, required: true },
  readBy: [{ type: String }], // Array of user IDs who have read the message
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GroupMessage ||
  mongoose.model("GroupMessage", groupMessageSchema);
