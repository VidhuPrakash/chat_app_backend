import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import LoginRequest from "../requests/loginRequests.js";
import responseMessages from "../../../config/response-messages.json" assert { type: "json" };
import userRepository from "../repositories/userRepository.js";
import RegisterRequest from "../requests/registerRequests.js";

const userRepo = new userRepository();

export default class AuthController {
  /**
   * Handles login requests by validating the request object using the LoginRequest
   * class, retrieving the user details, comparing the passwords, and generating a
   * JWT token on successful login.
   *
   * @param {Object} req - Request object containing the login credentials
   * @param {Object} res - Response object used to send the response back to the
   * client
   *
   * @returns {Promise<Object>} - Response object containing the status, message,
   * data, and error properties
   */
  async login(req, res) {
    try {
      // Validate request using LoginRequest class
      const validatedData = await LoginRequest.validate(req.body);
      // Retrieve user details
      const user = await userRepo.findByEmail(validatedData.email);
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 400,
          message: responseMessages.invalidPassword,
          data: null,
          error: [{ field: "password", message: "Invalid password" }],
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie(process.env.AUTH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      return res.status(200).json({
        status: 200,
        message: responseMessages.loginSuccess,
        data: {
          token,
          user: { _id: user._id, username: user.username, email: user.email },
        },
        error: null,
      });
    } catch (error) {
      if (error.name === "CustomValidationError") {
        const errors = Object.entries(error.errors).map(([field, message]) => ({
          field,
          message,
        }));
        return res.status(400).json({
          status: 400,
          message: "Validation failed",
          data: null,
          error: errors,
        });
      }
      return res.status(500).json({
        status: 500,
        message: responseMessages.serverError,
        data: null,
        error: error.message,
      });
    }
  }
  /**
   * Registers a new user with the provided data.
   * @param {Object} req.body - The request body containing the user data to be registered.
   * @param {Response} res - The response object to be sent back to the client.
   * @returns {Response} - A JSON response containing the newly registered user's JWT token
   * and user data, or an error message if registration fails.
   */
  async register(req, res) {
    try {
      const validatedData = await RegisterRequest.validate(req.body);
      // Save user
      const user = await userRepo.createUser(validatedData);

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.cookie(process.env.AUTH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      return res.status(201).json({
        status: 201,
        message: responseMessages["RegisterSuccess"],
        data: {
          token,
          user: { _id: user._id, username: user.username, email: user.email },
        },
        error: null,
      });
    } catch (error) {
      if (error.name === "CustomValidationError") {
        const errors = Object.entries(error.errors).map(([field, message]) => ({
          field,
          message,
        }));
        return res.status(400).json({
          status: 400,
          message: "Validation failed",
          data: null,
          error: errors,
        });
      }
      return res.status(500).json({
        status: 500,
        message: responseMessages["serverError"],
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Logs out the user by clearing the JWT token cookie.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<Response>} - A JSON response containing the success message
   */
  async logout(req, res) {
    try {
      res.clearCookie(process.env.AUTH_TOKEN_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return res.status(200).json({
        status: 200,
        message: "Logged out successfully",
        data: null,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: responseMessages["serverError"],
        data: null,
        error: error.message,
      });
    }
  }
}
