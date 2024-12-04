import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

export const registerUserValidationSchema = z.object({
  body: z.object({
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be 6 character" }),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, { message: "Password must be 6 character" }),
    userData: z.object({
      name: z.string().nonempty("Name is required"),
      contactNumber: z.string().optional(),
      email: z.string().email("Invalid email format"),
    }),
  }),
});
const verifyCodeValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
    verifyCode: z.number({ required_error: "Phone number is required" }),
  }),
});

const resendVerifyCodeSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
  }),
});
const userValidations = {
  registerUserValidationSchema,
  verifyCodeValidationSchema,
  resendVerifyCodeSchema,
};

export default userValidations;
