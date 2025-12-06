import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  getCurrentUser,
  changePassword,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  verifyForgotPassword,
  resendEmailVerification,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").post(verifyForgotPassword);
router.route("/resend-email-verification").post(resendEmailVerification);

export default router;
