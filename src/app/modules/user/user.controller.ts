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

const UserController = {
  registerUser,
};

export default UserController;
