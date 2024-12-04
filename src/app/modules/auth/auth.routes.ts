import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";

import auth from "../../middlewares/auth";
import authControllers from "./auth.controller";
import authValidations from "./auth.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/login",
  validateRequest(authValidations.loginValidationSchema),
  authControllers.loginUser
);
router.post(
  "/google-login",
  validateRequest(authValidations.googleSignUpValidationSchema),
  authControllers.googleLogin
);
router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  validateRequest(authValidations.changePasswordValidationSchema),
  authControllers.changePassword
);
router.post(
  "/refresh-token",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  validateRequest(authValidations.refreshTokenValidationSchema),
  authControllers.refreshToken
);

router.post(
  "/forget-password",
  validateRequest(authValidations.forgetPasswordValidationSchema),
  authControllers.forgetPassword
);
router.post(
  "/reset-password",
  validateRequest(authValidations.resetPasswordValidationSchema),
  authControllers.resetPassword
);
router.post(
  "/verify-reset-otp",
  validateRequest(authValidations.verifyResetOtpValidationSchema),
  authControllers.verifyResetOtp
);

router.post(
  "/resend-reset-code",
  validateRequest(authValidations.resendResetCodeValidationSchema),
  authControllers.resendResetCode
);

router.post(
  "/resend-verify-code",
  validateRequest(authValidations.resendResetCodeValidationSchema),
  authControllers.resendResetCode
);

export const authRoutes = router;
