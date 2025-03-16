import express from "express";
import AuthController from "../controller/authController.js";

const router = express.Router();
const authController = new AuthController();

// route for login
router.post("/login", (req, res) => authController.login(req, res));
// route for register
router.post("/register", (req, res) => authController.register(req, res));
// route for logout
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
