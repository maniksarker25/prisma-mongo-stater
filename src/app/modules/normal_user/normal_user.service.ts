import { NormalUser } from "@prisma/client";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import prisma from "../../utils/prisma";

const updateUserProfile = async (id: string, payload: Partial<NormalUser>) => {
  console.log(id);
  if (payload.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can not change the email or username"
    );
  }

  const user = await prisma.normalUser.findUnique({
    where: { id: id },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  }
  const result = await prisma.normalUser.update({
    where: { id: id },
    data: {
      ...payload,
    },
  });
  return result;
};

const NormalUserService = {
  updateUserProfile,
};

export default NormalUserService;
