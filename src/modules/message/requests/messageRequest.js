import Joi from "joi";
import cleanErrorMessage from "../../../utils/cleanErrorMessage.js";
import { CustomValidationError } from "../../../exceptions/customValidationError.js";

const messageSchema = Joi.object({
  receiver: Joi.string().required().messages({
    "any.required": "Receiver ID is required.",
    "string.base": "Receiver must be a valid ID.",
  }),
  message: Joi.string().required().messages({
    "any.required": "Message cannot be empty.",
  }),
});

export default class MessageRequest {
  /**
   * Validates the request object using the messageSchema and returns the validated
   * request object.
   *
   * @param {Object} request - The request object to be validated
   * @returns {Object} - The validated request object
   * @throws {CustomValidationError} - If validation fails
   */
  static async validate(request) {
    const { error, value } = messageSchema.validate(request, {
      abortEarly: false,
    });

    if (error) {
      const validationErrors = {};
      error.details.forEach((err) => {
        validationErrors[err.context.key] = cleanErrorMessage(err.message);
      });
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}
