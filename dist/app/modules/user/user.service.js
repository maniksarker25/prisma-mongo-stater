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
const appError_1 = __importDefault(require("../../errors/appError"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendEmail_1 = __importDefault(require("../../utils/sendEmail"));
const registerSuccessEmail_1 = __importDefault(require("../../mail/registerSuccessEmail"));
const generateVerifyCode = () => {
    return Math.floor(10000 + Math.random() * 90000);
};
const registerUser = (password, confirmPassword, userData) => __awaiter(void 0, void 0, void 0, function* () {
    if (password !== confirmPassword) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password and confirm password doesn't match");
    }
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { email: userData.email },
    });
    if (isUserExist) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "This email already exists");
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 12);
    const verifyCode = generateVerifyCode();
    const userDataPayload = {
        email: userData === null || userData === void 0 ? void 0 : userData.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
        verifyCode,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const createUser = yield transactionClient.user.create({
            data: userDataPayload,
        });
        const createNormalUserData = yield transactionClient.normalUser.create({
            data: Object.assign(Object.assign({}, userData), { userId: createUser === null || createUser === void 0 ? void 0 : createUser.id }),
        });
        return createNormalUserData;
    }));
    (0, sendEmail_1.default)({
        email: userData.email,
        subject: "Activate Your Account",
        html: (0, registerSuccessEmail_1.default)(result.name, verifyCode),
    });
    return result;
});
const verifyCode = (email, verifyCode) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.codeExpireIn && user.codeExpireIn < new Date(Date.now())) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Verify code is expired");
    }
    if (verifyCode !== user.verifyCode) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Code doesn't match");
    }
    const result = yield prisma_1.default.user.update({
        where: { email: email },
        data: {
            isVerified: true,
        },
    });
    return result;
});
const resendVerifyCode = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: email },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const verifyCode = generateVerifyCode();
    const updateUser = yield prisma_1.default.user.update({
        where: { email: email },
        data: {
            verifyCode: verifyCode,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        },
    });
    if (!updateUser) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Something went wrong . Please again resend the code after a few second");
    }
    (0, sendEmail_1.default)({
        email: user.email,
        subject: "Activate Your Account",
        html: (0, registerSuccessEmail_1.default)("Dear", updateUser.verifyCode),
    });
    return null;
});
const getMyProfile = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    let result = null;
    if (userData.role === client_1.UserRole.USER) {
        result = yield prisma_1.default.normalUser.findUnique({
            where: { email: userData.email },
        });
    }
    else if (userData.role === client_1.UserRole.ADMIN) {
        result = yield prisma_1.default.admin.findUnique({
            where: { email: userData.email },
        });
    }
    return result;
});
const UserService = {
    registerUser,
    verifyCode,
    resendVerifyCode,
    getMyProfile,
};
exports.default = UserService;
