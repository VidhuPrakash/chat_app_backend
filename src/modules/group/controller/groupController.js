import GroupRepository from "../repositories/groupRepository.js";

const groupRepo = new GroupRepository();

export default class GroupController {
  /**
   * Retrieves all groups and returns them in the response.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  async getGroups(req, res) {
    try {
      const groups = await groupRepo.findAllGroups();
      return res.status(200).json({
        status: 200,
        message: "Groups fetched successfully",
        data: groups,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        data: null,
        error: error.message,
      });
    }
  }
}
