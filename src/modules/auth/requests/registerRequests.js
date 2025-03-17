import Joi from "joi";
import { CustomValidationError } from "../../../exceptions/customValidationError.js";
import responseMessages from "../../../config/response-messages.json" with { type: "json" };
import userRepository from "../repositories/userRepository.js";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";
import cleanErrorMessage from "../../../utils/cleanErrorMessage.js";

const userRepo = new userRepository();

const schema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).options({ messages: joiCustomMessages });

export default class RegisterRequest {
  /**
   * Validates the request object using Joi schema and checks if the email is already
   * registered and if the username is taken.
   *
   * @param {Object} request - The request object to be validated
   * @returns {Object} - The validated request object
   * @throws {CustomValidationError} - If validation fails
   */
  static async validate(request) {
    const { error, value } = schema.validate(request, { abortEarly: false });

    const validationErrors = {};
    if (error) {
      error.details.forEach((err) => {
        validationErrors[err.context.key] = cleanErrorMessage(err.message);
      });

      throw new CustomValidationError(validationErrors);
    }

    // Check if email is already registered
    if (await userRepo.findByEmail(value.email)) {
      validationErrors["email"] = responseMessages["emailAlreadyExists"];
    }

    // Check if username is taken
    if (await userRepo.findByUsername(value.username)) {
      validationErrors["username"] = responseMessages["usernameTaken"];
    }

    if (Object.keys(validationErrors).length !== 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}
