/**
 * Cleans and formats an error message for better readability.
 * @param {string} errorMessage - The error message to be cleaned.
 * @returns {string} The cleaned and formatted error message.
 */
const cleanErrorMessage = (errorMessage) => {
  // Remove special characters from the error message
  const cleanedMessage = errorMessage.replace(/[",']/g, "");
  // Replace underscores with spaces in the cleaned error message.
  let newCleanedMessage = cleanedMessage.replace("_", " ");
  newCleanedMessage = newCleanedMessage.replace("_", " ");

  if (newCleanedMessage.endsWith(" id")) {
    return newCleanedMessage.slice(0, -3) + ".";
  }
  return newCleanedMessage + ".";
};

export default cleanErrorMessage;
