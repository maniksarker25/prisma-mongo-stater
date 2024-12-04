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
/* eslint-disable no-unused-vars */
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const appError_1 = __importDefault(require("../../errors/appError"));
const auth_utils_1 = require("./auth.utils");
const client_1 = require("@prisma/client");
const sendEmail_1 = __importDefault(require("../../utils/sendEmail"));
const resetPasswordEmailBody_1 = __importDefault(require("../../mail/resetPasswordEmailBody"));
const generateVerifyCode = () => {
    return Math.floor(10000 + Math.random() * 90000);
};
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
    }
    if (user.isDeleted) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
    }
    if (user.status === "BLOCKED") {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
    }
    if (!user.isVerified) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not verified user . Please verify your email");
    }
    // checking if the password is correct ----
    const isPasswordMatched = yield bcrypt_1.default.compare(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordMatched) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password does not matched");
    }
    const jwtPayload = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const loginWithGoogle = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const inviteRewardPoint = 100; // Replace with your invite reward logic
    const prismaTransaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if the user already exists
        const isExistUser = yield prisma.user.findUnique({
            where: { email: payload.email },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
            },
        });
        if (isExistUser) {
            const jwtPayload = {
                id: isExistUser.id,
                email: isExistUser.email,
                role: isExistUser.role,
            };
            const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
            const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
            return { accessToken, refreshToken };
        }
        // If user doesn't exist, create a new user
        const createUser = yield prisma.user.create({
            data: {
                email: payload.email,
                role: client_1.UserRole.USER,
                password: "userPassword",
            },
        });
        const normalUserData = {
            name: payload.name,
            email: payload.email,
            profile_image: payload.profile_image,
            userId: createUser.id,
        };
        yield prisma.normalUser.create({
            data: normalUserData,
        });
        // Create JWT tokens
        const jwtPayload = {
            id: createUser.id,
            email: createUser.email,
            role: createUser.role,
        };
        const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
        const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
        return { accessToken, refreshToken };
    }));
    return prismaTransaction;
});
// change password
const changePasswordIntoDB = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.newPassword !== payload.confirmNewPassword) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password and confirm password doesn't match");
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { email: userData.email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
    }
    if (user.isDeleted) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(payload === null || payload === void 0 ? void 0 : payload.oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordMatched) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Current password does not matched");
    }
    //hash new password
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
        where: { email: userData.email },
        data: {
            password: newHashedPassword,
            passwordChangedAt: new Date(),
        },
    });
    return null;
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, email, iat } = decoded;
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
    // if (
    //   user?.passwordChangedAt &&
    //   (await User.isJWTIssuedBeforePasswordChange(
    //     user?.passwordChangedAt,
    //     iat as number,
    //   ))
    // ) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    // }
    const jwtPayload = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { accessToken };
});
// forgot password
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
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
    const resetCode = generateVerifyCode();
    const codeExpireIn = new Date(Date.now() + 5 * 60000); // Code expires in 5 minutes
    // Update the user with the reset code and expiration time
    yield prisma_1.default.user.update({
        where: { email },
        data: {
            resetCode,
            isResetVerified: false,
            codeExpireIn,
        },
    });
    (0, sendEmail_1.default)({
        email: user.email,
        subject: "Reset password code",
        html: (0, resetPasswordEmailBody_1.default)("Dear", resetCode),
    });
    return null;
});
// verify forgot otp
const verifyResetOtp = (email, resetCode) => __awaiter(void 0, void 0, void 0, function* () {
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
    if ((user === null || user === void 0 ? void 0 : user.codeExpireIn) && (user === null || user === void 0 ? void 0 : user.codeExpireIn) < new Date(Date.now())) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Reset code is expire");
    }
    if (user.resetCode !== Number(resetCode)) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Reset code is invalid");
    }
    yield prisma_1.default.user.update({
        where: { email: email },
        data: {
            isResetVerified: true,
        },
    });
    return null;
});
// reset password
const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.password !== payload.confirmPassword) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password and confirm password doesn't match");
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
    }
    if (!user.isResetVerified) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "You need to verify reset code before reset password");
    }
    if (user.isDeleted) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
    }
    // verify token -------------
    // const decoded = jwt.verify(
    //   token,
    //   config.jwt_access_secret as string,
    // ) as JwtPayload;
    // // console.log(decoded.userId, payload.id);
    // if (decoded?.userId !== payload?.email) {
    //   throw new AppError(
    //     httpStatus.FORBIDDEN,
    //     'You are forbidden to access this',
    //   );
    // }
    //hash new password
    const newHashedPassword = yield bcrypt_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    // update the new password
    yield prisma_1.default.user.update({
        where: {
            email: payload.email,
        },
        data: {
            password: newHashedPassword,
            passwordChangedAt: new Date(),
        },
    });
    const jwtPayload = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return { accessToken, refreshToken };
});
const resendResetCode = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
    }
    if (user.isDeleted) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
    }
    const resetCode = generateVerifyCode();
    yield prisma_1.default.user.update({
        where: {
            email: email,
        },
        data: {
            resetCode: resetCode,
            isResetVerified: false,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        },
    });
    (0, sendEmail_1.default)({
        email: user.email,
        subject: "Reset password code",
        html: (0, resetPasswordEmailBody_1.default)("Dear", resetCode),
    });
    return null;
});
const resendVerifyCode = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "This user does not exist");
    }
    if (user.isDeleted) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is already deleted");
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
    }
    const verifyCode = generateVerifyCode();
    yield prisma_1.default.user.update({
        where: {
            email: email,
        },
        data: {
            verifyCode: verifyCode,
            isVerified: false,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        },
    });
    (0, sendEmail_1.default)({
        email: user.email,
        subject: "Reset password code",
        html: (0, resetPasswordEmailBody_1.default)("Dear", verifyCode),
    });
    return null;
});
const authServices = {
    loginUserIntoDB,
    changePasswordIntoDB,
    refreshToken,
    forgetPassword,
    resetPassword,
    verifyResetOtp,
    resendResetCode,
    loginWithGoogle,
    resendVerifyCode,
};
exports.default = authServices;
