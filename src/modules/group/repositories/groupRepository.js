import group from "../models/group.js";
import groupMessage from "../models/groupMessage.js";

export default class GroupRepository {
  /**
   * Creates a new group with the given name and creator.
   * @param {Object} param - Object containing the group details.
   * @param {string} param.name - The name of the group.
   * @param {ObjectId} param.creatorId - The ID of the user creating the group.
   * @returns {Promise<Group>} - The newly created group.
   */

  async createGroup({ name, creatorId }) {
    const newGroup = new group({
      name,
      members: [creatorId],
      createdBy: creatorId,
    });
    return await newGroup.save();
  }

  /**
   * Adds a user to the members of a group.
   * @param {ObjectId} groupId - The id of the group to add the user to.
   * @param {ObjectId} userId - The id of the user to add.
   * @returns {Promise<Group>} - The updated group with the added user.
   */
  async addMember(groupId, userId) {
    return await group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }

  /**
   * Retrieves all groups and returns their id and name.
   * @return {Promise<Array>} - Array of groups with id and name fields.
   */

  async findAllGroups() {
    return await group.find({}, "id name").lean();
  }

  /**
   * Finds a group by its id.
   * @param {ObjectId} groupId - The id of the group to find.
   * @returns {Promise<Group|undefined>} - The group found, or undefined if not found.
   */
  async findById(groupId) {
    return await group.findById(groupId);
  }

  /**
   * Retrieves all messages in a group and returns them sorted by their creation date.
   * @param {ObjectId} groupId - The id of the group to find messages in.
   * @returns {Promise<Array>} - Array of messages in the group, sorted by creation date.
   */
  async findMessagesByGroupId(groupId) {
    return await groupMessage
      .find({ group: groupId })
      .sort({ createdAt: 1 })
      .lean();
  }
}
