/**
 * CustomValidationError class extends the built-in Error class
 */
export class CustomValidationError extends Error {
  /**
   * Constructor for CustomValidationError class
   * @param {Object} errors - object containing cleaned error messages
   */
  constructor(errors) {
    super(errors);
    this.name = "CustomValidationError";
    this.errors = errors;
  }
}
