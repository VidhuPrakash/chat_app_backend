import Joi from "joi";
import { CustomValidationError } from "../../../exceptions/customValidationError.js";
import responseMessages from "../../../config/response-messages.json" assert { type: "json" };
import userRepository from "../repositories/userRepository.js";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";
import cleanErrorMessage from "../../../utils/cleanErrorMessage.js";

const userRepo = new userRepository();

// Define custom options for Joi validation, including custom error messages
const options = {
  messages: joiCustomMessages,
};

// Define validation schema for login
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options(options);

/**
 * Class that encapsulates authentication request validation logic.
 */
export default class LoginRequest {
  /**
   * Validate the request object using Joi schema.
   * @param {Object} request - Login request payload
   * @returns {Object} - Validated request object
   * @throws {CustomValidationError} - If validation fails
   */
  static async validate(request) {
    const { error, value } = schema.validate(request, { abortEarly: false });

    // Collect validation errors
    const validationErrors = {};

    if (error) {
      error.details.forEach((err) => {
        validationErrors[err.context.key] = cleanErrorMessage(err.message);
      });

      throw new CustomValidationError(validationErrors);
    }

    // Check if user exists
    const user = await userRepo.findByEmail(value.email);

    if (!user) {
      validationErrors["email"] = responseMessages["userNotFound"];
    }

    // If there are errors, throw a validation error
    if (Object.keys(validationErrors).length !== 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}
