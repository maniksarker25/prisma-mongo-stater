"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = __importDefault(require("./user.validation"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/register-user", (0, validateRequest_1.default)(user_validation_1.default.registerUserValidationSchema), user_controller_1.default.registerUser);
router.post("/verify-code", (0, validateRequest_1.default)(user_validation_1.default.verifyCodeValidationSchema), user_controller_1.default.verifyCode);
router.post("/resend-verify-code", (0, validateRequest_1.default)(user_validation_1.default.resendVerifyCodeSchema), user_controller_1.default.resendVerifyCode);
router.get("/get-my-profile", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.USER), user_controller_1.default.getMyProfile);
exports.userRoutes = router;
