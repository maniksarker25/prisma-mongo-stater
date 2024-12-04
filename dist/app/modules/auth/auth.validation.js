"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
        password: zod_1.z.string({ required_error: "Password is required" }),
    }),
});
const googleSignUpValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is required" }),
        email: zod_1.z.string({ required_error: "Email is required" }),
        profile_image: zod_1.z.string().optional(),
    }),
});
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({ required_error: "Old password is required" }),
        newPassword: zod_1.z.string({ required_error: "Password is required" }),
        confirmNewPassword: zod_1.z.string({
            required_error: "Confirm password is required",
        }),
    }),
});
// refresh token validation schema -----------
const refreshTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({ required_error: "Refresh token is required" }),
    }),
});
// forget password validation schema
const forgetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
    }),
});
// reset password validation schema
const resetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
        password: zod_1.z.string({ required_error: "Password is required" }),
        confirmPassword: zod_1.z.string({
            required_error: "Confirm password is required",
        }),
    }),
});
const verifyResetOtpValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
        resetCode: zod_1.z.number({
            required_error: "Reset code is required",
            invalid_type_error: "Reset code must be number",
        }),
    }),
});
const resendResetCodeValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }),
    }),
});
const authValidations = {
    loginValidationSchema,
    changePasswordValidationSchema,
    refreshTokenValidationSchema,
    forgetPasswordValidationSchema,
    resetPasswordValidationSchema,
    verifyResetOtpValidationSchema,
    resendResetCodeValidationSchema,
    googleSignUpValidationSchema,
};
exports.default = authValidations;
