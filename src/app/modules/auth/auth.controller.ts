import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import authServices from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User login successfully",
    data: result,
  });
});
const googleLogin = catchAsync(async (req, res) => {
  const result = await authServices.loginWithGoogle(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User login successfully",
    data: result,
  });
});
const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;
  const result = await authServices.changePasswordIntoDB(
    req.user,
    passwordData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password is updated successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully",
    data: result,
  });
});
const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await authServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset code send to the email",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  // const token = req?.headers?.authorization;

  // if (!token) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Your token is invalid');
  // }
  const result = await authServices.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});
const verifyResetOtp = catchAsync(async (req, res) => {
  const result = await authServices.verifyResetOtp(
    req.body.email,
    req.body.resetCode
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset code verified",
    data: result,
  });
});

const resendResetCode = catchAsync(async (req, res) => {
  const result = await authServices.resendResetCode(req?.body.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset code resend successfully",
    data: result,
  });
});
const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await authServices.resendVerifyCode(req?.body.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verify code resend successfully",
    data: result,
  });
});

const authControllers = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyResetOtp,
  resendResetCode,
  googleLogin,
  resendVerifyCode,
};

export default authControllers;
