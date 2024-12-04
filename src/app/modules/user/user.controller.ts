import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import UserService from "./user.service";

const registerUser = catchAsync(async (req, res) => {
  const result = await UserService.registerUser(
    req.body.password,
    req.body.confirmPassword,
    req.body.userData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registration successful.Check email for verify your email",
    data: result,
  });
});
const verifyCode = catchAsync(async (req, res) => {
  const result = await UserService.verifyCode(
    req?.body?.email,
    req?.body?.verifyCode
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully verified your account with email",
    data: result,
  });
});
const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await UserService.resendVerifyCode(req?.body?.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verify code send to your email inbox",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const result = await UserService.getMyProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully retrieved your data",
    data: result,
  });
});
const UserController = {
  registerUser,
  verifyCode,
  resendVerifyCode,
  getMyProfile,
};

export default UserController;
