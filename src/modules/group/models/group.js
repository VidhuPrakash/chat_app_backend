import mongoose from "mongoose";

/**
 * Group schema
 * @typedef Group
 * @property {string} name - The name of the group.
 * @property {Array} members - An array of user IDs who are members of the group.
 * @property {ObjectId} createdBy - The ID of the user who created the group.
 */
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
