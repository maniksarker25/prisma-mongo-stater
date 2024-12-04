/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { UserRole, UserStatus } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/appError";
import prisma from "../utils/prisma";

// make costume interface

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // check if the token is sent from client -----
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized 1");
    }
    // check if the token is valid-
    // checking if the given token is valid

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is expired");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, role, email, username, iat } = decoded;

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is expired");
    }
    // get the user if that here ---------
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
    if (!user?.isVerified) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are not verified user");
    }

    let profileData;
    if (role === UserRole.USER) {
      // profileData = await NormalUser.findOne({ user: id }).select("_id");
      profileData = await prisma.normalUser.findUnique({
        where: { userId: id },
        select: { id: true },
      });
    } else if (role === UserRole.ADMIN) {
      profileData = await prisma.admin.findUnique({
        where: { userId: id },
        select: { id: true },
      });
    }

    decoded.profileId = profileData?.id;
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
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized 3");
    }
    // add those properties in req
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
