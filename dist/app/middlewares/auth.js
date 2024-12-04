"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const client_1 = require("@prisma/client");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// make costume interface
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // check if the token is sent from client -----
        const token = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
        if (!token) {
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Your are not authorized 1");
        }
        // check if the token is valid-
        // checking if the given token is valid
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
        }
        catch (err) {
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Token is expired");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, role, email, username, iat } = decoded;
        if (!decoded) {
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Token is expired");
        }
        // get the user if that here ---------
        const user = yield prisma_1.default.user.findUnique({ where: { email: email } });
        if (!user) {
            throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
        }
        if (user.isDeleted) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
        }
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
        }
        if (!(user === null || user === void 0 ? void 0 : user.isVerified)) {
            throw new appError_1.default(http_status_1.default.BAD_REQUEST, "You are not verified user");
        }
        let profileData;
        if (role === client_1.UserRole.USER) {
            // profileData = await NormalUser.findOne({ user: id }).select("_id");
            profileData = yield prisma_1.default.normalUser.findUnique({
                where: { userId: id },
                select: { id: true },
            });
        }
        else if (role === client_1.UserRole.ADMIN) {
            profileData = yield prisma_1.default.admin.findUnique({
                where: { userId: id },
                select: { id: true },
            });
        }
        decoded.profileId = profileData === null || profileData === void 0 ? void 0 : profileData.id;
        // if (
        //   user?.passwordChangedAt &&
        //   (await User.isJWTIssuedBeforePasswordChange(
        //     user?.passwordChangedAt,
        //     iat as number,
        //   ))
        // ) {
        //   throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized 2');
        // }
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Your are not authorized 3");
        }
        // add those properties in req
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
