import jwt from "jsonwebtoken";

/**
 * Authentication middleware to verify the JWT token sent in the Authorization
 * header of the request. If the token is valid, it adds the user data to the
 * request object. If the token is invalid or missing, it returns a 401 or 400
 * error response, respectively.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {function} next - The next middleware function in the stack
 * @returns {void}
 */
export default function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Access denied. No token provided.",
      data: null,
      error: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user data to request
    next();
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Invalid token",
      data: null,
      error: error.message,
    });
  }
}
