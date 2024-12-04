/* eslint-disable no-unused-vars */
import httpStatus from "http-status";
import config from "../../config";
import bcrypt from "bcrypt";
import { ILoginWithGoogle, TLoginUser, TUserRole } from "./auth.interface";
import prisma from "../../utils/prisma";
import AppError from "../../errors/appError";
import { createToken, verifyToken } from "./auth.utils";
import { UserRole, UserStatus } from "@prisma/client";
import sendEmail from "../../utils/sendEmail";
import resetPasswordEmailBody from "../../mail/resetPasswordEmailBody";
import { JwtPayload } from "jsonwebtoken";
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }
  if (!user.isVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not verified user . Please verify your email"
    );
  }
  // checking if the password is correct ----

  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
  }
  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    role: user?.role as UserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const loginWithGoogle = async (payload: ILoginWithGoogle) => {
  const inviteRewardPoint = 100; // Replace with your invite reward logic

  const prismaTransaction = await prisma.$transaction(async (prisma) => {
    // Check if the user already exists
    const isExistUser = await prisma.user.findUnique({
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

      const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string
      );

      const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as string
      );

      return { accessToken, refreshToken };
    }

    // If user doesn't exist, create a new user
    const createUser = await prisma.user.create({
      data: {
        email: payload.email,
        role: UserRole.USER,
        password: "userPassword",
      },
    });

    const normalUserData = {
      name: payload.name,
      email: payload.email,
      profile_image: payload.profile_image,
      userId: createUser.id,
    };

    await prisma.normalUser.create({
      data: normalUserData,
    });

    // Create JWT tokens
    const jwtPayload = {
      id: createUser.id,
      email: createUser.email,
      role: createUser.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );

    return { accessToken, refreshToken };
  });

  return prismaTransaction;
};

// change password
const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
) => {
  if (payload.newPassword !== payload.confirmNewPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match"
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload?.newPassword,
    user?.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
  }
  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  await prisma.user.update({
    where: { email: userData.email },
    data: {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  });
  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, email, iat } = decoded;

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
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
    id: user?.id,
    email: user?.email,
    role: user?.role as UserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  return { accessToken };
};

// forgot password
const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }

  const resetCode = generateVerifyCode();
  const codeExpireIn = new Date(Date.now() + 5 * 60000); // Code expires in 5 minutes

  // Update the user with the reset code and expiration time
  await prisma.user.update({
    where: { email },
    data: {
      resetCode,
      isResetVerified: false,
      codeExpireIn,
    },
  });
  sendEmail({
    email: user.email,
    subject: "Reset password code",
    html: resetPasswordEmailBody("Dear", resetCode),
  });

  return null;
};

// verify forgot otp

const verifyResetOtp = async (email: string, resetCode: number) => {
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }

  if (user?.codeExpireIn && user?.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reset code is expire");
  }
  if (user.resetCode !== Number(resetCode)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reset code is invalid");
  }
  await prisma.user.update({
    where: { email: email },
    data: {
      isResetVerified: true,
    },
  });
  return null;
};

// reset password
const resetPassword = async (payload: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  if (payload.password !== payload.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match"
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (!user.isResetVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You need to verify reset code before reset password"
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
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
  const newHashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  // update the new password
  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  });
  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    role: user?.role as UserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

const resendResetCode = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }

  const resetCode = generateVerifyCode();
  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      resetCode: resetCode,
      isResetVerified: false,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  });
  sendEmail({
    email: user.email,
    subject: "Reset password code",
    html: resetPasswordEmailBody("Dear", resetCode),
  });

  return null;
};
const resendVerifyCode = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is already deleted");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
  }

  const verifyCode = generateVerifyCode();

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      verifyCode: verifyCode,
      isVerified: false,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  });
  sendEmail({
    email: user.email,
    subject: "Reset password code",
    html: resetPasswordEmailBody("Dear", verifyCode),
  });

  return null;
};

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

export default authServices;
