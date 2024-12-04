import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import NormalUserService from "./normal_user.service";

const updateUserProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === "object" && "profile_image" in files) {
    req.body.profile_image = files["profile_image"][0].path;
  }
  const result = await NormalUserService.updateUserProfile(
    req.user.profileId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const NormalUserController = {
  updateUserProfile,
};
export default NormalUserController;
