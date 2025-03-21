"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_validation_1 = __importDefault(require("./auth.validation"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.default.loginValidationSchema), auth_controller_1.default.loginUser);
router.post("/google-login", (0, validateRequest_1.default)(auth_validation_1.default.googleSignUpValidationSchema), auth_controller_1.default.googleLogin);
router.post("/change-password", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.USER), (0, validateRequest_1.default)(auth_validation_1.default.changePasswordValidationSchema), auth_controller_1.default.changePassword);
router.post("/refresh-token", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.USER), (0, validateRequest_1.default)(auth_validation_1.default.refreshTokenValidationSchema), auth_controller_1.default.refreshToken);
router.post("/forget-password", (0, validateRequest_1.default)(auth_validation_1.default.forgetPasswordValidationSchema), auth_controller_1.default.forgetPassword);
router.post("/reset-password", (0, validateRequest_1.default)(auth_validation_1.default.resetPasswordValidationSchema), auth_controller_1.default.resetPassword);
router.post("/verify-reset-otp", (0, validateRequest_1.default)(auth_validation_1.default.verifyResetOtpValidationSchema), auth_controller_1.default.verifyResetOtp);
router.post("/resend-reset-code", (0, validateRequest_1.default)(auth_validation_1.default.resendResetCodeValidationSchema), auth_controller_1.default.resendResetCode);
router.post("/resend-verify-code", (0, validateRequest_1.default)(auth_validation_1.default.resendResetCodeValidationSchema), auth_controller_1.default.resendResetCode);
exports.authRoutes = router;
