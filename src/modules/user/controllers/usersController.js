import UsersRepository from "../repositories/usersRepository.js";

const usersRepo = new UsersRepository();

export default class UsersController {

  /**
   * Retrieves all users and returns their id and username.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  async getAllUsers(req, res) {
    try {
      const loggedInUserId = req.user?.id;
      const messages = await usersRepo.findAllusers(loggedInUserId);

      return res.status(200).json({
        status: true,
        message: "All users fetched successfully",
        data: messages,
        error: null,
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Failed to fetch all users",
        data: null,
        error: error.message || error,
      });
    }
  }
}
