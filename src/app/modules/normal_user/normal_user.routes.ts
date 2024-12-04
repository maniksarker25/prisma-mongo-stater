import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { uploadFile } from "../../helpers/fileUploader";
import NormalUserController from "./normal_controller";
import validateRequest from "../../middlewares/validateRequest";
import normalUserValidations from "./normal_user.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.patch(
  "/update-profile",
  auth(UserRole.USER),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(normalUserValidations.updateNormalUserDataValidationSchema),
  NormalUserController.updateUserProfile
);

export const normalUserRoutes = router;
