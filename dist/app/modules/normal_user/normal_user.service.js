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
const appError_1 = __importDefault(require("../../errors/appError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const updateUserProfile = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    if (payload.email) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "You can not change the email or username");
    }
    const user = yield prisma_1.default.normalUser.findUnique({
        where: { id: id },
    });
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Profile not found");
    }
    const result = yield prisma_1.default.normalUser.update({
        where: { id: id },
        data: Object.assign({}, payload),
    });
    return result;
});
const NormalUserService = {
    updateUserProfile,
};
exports.default = NormalUserService;
