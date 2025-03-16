import User from "../models/user.js";

/**
 * Repository for user operations
 */
export default class UserRepository {
  /**
   * Finds a user by their email address
   * @param {string} email - user email address
   * @return {Promise<User|undefined>}
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Finds a user by their id
   * @param {string} id - user id
   * @return {Promise<User|undefined>}
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Creates a new user with the given data
   * @param {Object} userData - user data to be saved
   * @return {Promise<User>} - newly created user
   */
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Finds a user by their username
   * @param {string} username - user username
   * @return {Promise<User|undefined>}
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  /**
   * Finds usernames of the given sender IDs
   * @param {ObjectId[]} id - sender IDs
   * @return {Promise<User[]>} - an array of user documents with only the username field
   */
  async findUserNameBySenderId(id) {
    return await User.find({ _id: { $in: id } }, "username").lean();
  }
}
