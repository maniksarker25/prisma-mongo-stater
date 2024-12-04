import express from "express";
import UserController from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import userValidations from "./user.validation";

const router = express.Router();

router.post(
  "/register-user",
  validateRequest(userValidations.registerUserValidationSchema),
  UserController.registerUser
);

export const userRoutes = router;
