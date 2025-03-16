import User from "../../auth/models/user.js";

/**
 * Repository for all users operations
 */
export default class UsersRepository {
  /**
   * Finds all users and returns their id and username.
   * @return {Promise<User[]>} - Array of users
   */
  async findAllusers(userId) {
    return await User.find({ _id: { $ne: userId } }, "id username");
  }
}
