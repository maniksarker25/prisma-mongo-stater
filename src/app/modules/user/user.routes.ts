import express from "express";
import UserController from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import userValidations from "./user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/register-user",
  validateRequest(userValidations.registerUserValidationSchema),
  UserController.registerUser
);
router.post(
  "/verify-code",
  validateRequest(userValidations.verifyCodeValidationSchema),
  UserController.verifyCode
);

router.post(
  "/resend-verify-code",
  validateRequest(userValidations.resendVerifyCodeSchema),
  UserController.resendVerifyCode
);
router.get(
  "/get-my-profile",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  UserController.getMyProfile
);
export const userRoutes = router;
