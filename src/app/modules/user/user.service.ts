import httpStatus from "http-status";
import AppError from "../../errors/appError";
import { Admin, NormalUser, User, UserRole } from "@prisma/client";
import prisma from "../../utils/prisma";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail";
import registrationSuccessEmailBody from "../../mail/registerSuccessEmail";
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};

const registerUser = async (
  password: string,
  confirmPassword: string,
  userData: NormalUser
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match"
    );
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const verifyCode = generateVerifyCode();
  const userDataPayload = {
    email: userData?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    verifyCode,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createUser = await transactionClient.user.create({
      data: userDataPayload,
    });
    const createNormalUserData = await transactionClient.normalUser.create({
      data: { ...userData, userId: createUser?.id },
    });
    return createNormalUserData;
  });
  sendEmail({
    email: userData.email,
    subject: "Activate Your Account",
    html: registrationSuccessEmailBody(result.name, verifyCode),
  });
  return result;
};

const UserService = {
  registerUser,
};

export default UserService;
