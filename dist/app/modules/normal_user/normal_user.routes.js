"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalUserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploader_1 = require("../../helpers/fileUploader");
const normal_controller_1 = __importDefault(require("./normal_controller"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const normal_user_validation_1 = __importDefault(require("./normal_user.validation"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.patch("/update-profile", (0, auth_1.default)(client_1.UserRole.USER), (0, fileUploader_1.uploadFile)(), (req, res, next) => {
    if (req.body.data) {
        req.body = JSON.parse(req.body.data);
    }
    next();
}, (0, validateRequest_1.default)(normal_user_validation_1.default.updateNormalUserDataValidationSchema), normal_controller_1.default.updateUserProfile);
exports.normalUserRoutes = router;
