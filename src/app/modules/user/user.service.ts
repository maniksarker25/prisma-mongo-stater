import httpStatus from "http-status";
import AppError from "../../errors/appError";
import { Admin, NormalUser, User, UserRole } from "@prisma/client";
import prisma from "../../utils/prisma";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail";
import registrationSuccessEmailBody from "../../mail/registerSuccessEmail";
import { JwtPayload } from "jsonwebtoken";
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
const verifyCode = async (email: string, verifyCode: number) => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.codeExpireIn && user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Verify code is expired");
  }
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }

  const result = await prisma.user.update({
    where: { email: email },
    data: {
      isVerified: true,
    },
  });

  return result;
};

const resendVerifyCode = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const verifyCode = generateVerifyCode();

  const updateUser = await prisma.user.update({
    where: { email: email },
    data: {
      verifyCode: verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  });
  if (!updateUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong . Please again resend the code after a few second"
    );
  }
  sendEmail({
    email: user.email,
    subject: "Activate Your Account",
    html: registrationSuccessEmailBody("Dear", updateUser.verifyCode as number),
  });
  return null;
};
const getMyProfile = async (userData: JwtPayload) => {
  let result = null;
  if (userData.role === UserRole.USER) {
    result = await prisma.normalUser.findUnique({
      where: { email: userData.email },
    });
  } else if (userData.role === UserRole.ADMIN) {
    result = await prisma.admin.findUnique({
      where: { email: userData.email },
    });
  }
  return result;
};
const UserService = {
  registerUser,
  verifyCode,
  resendVerifyCode,
  getMyProfile,
};

export default UserService;
