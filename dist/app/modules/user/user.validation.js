"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserValidationSchema = void 0;
const zod_1 = require("zod");
exports.registerUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({ required_error: "Password is required" })
            .min(6, { message: "Password must be 6 character" }),
        confirmPassword: zod_1.z
            .string({ required_error: "Confirm password is required" })
            .min(6, { message: "Password must be 6 character" }),
        userData: zod_1.z.object({
            name: zod_1.z.string().nonempty("Name is required"),
            contactNumber: zod_1.z.string().optional(),
            email: zod_1.z.string().email("Invalid email format"),
        }),
    }),
});
const verifyCodeValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
        verifyCode: zod_1.z.number({ required_error: "Phone number is required" }),
    }),
});
const resendVerifyCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
    }),
});
const userValidations = {
    registerUserValidationSchema: exports.registerUserValidationSchema,
    verifyCodeValidationSchema,
    resendVerifyCodeSchema,
};
exports.default = userValidations;
