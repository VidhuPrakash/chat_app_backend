import mongoose from "mongoose";

/**
 * Message schema
 * @typedef Message
 * @property {ObjectId} sender - The ID of the user who sent the message.
 * @property {ObjectId} receiver - The ID of the user who received the message.
 * @property {string} message - The content of the message.
 * @property {boolean} read - Whether the message has been read by the receiver.
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }, // Track read status
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
