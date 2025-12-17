import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { Conversation } from "../models/conversations.models.js";
import { Message } from "../models/message.models.js";

const findUser = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw new ApiError(400, "Invalid query");
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      {
        username: {
          $regex: query,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: query,
          $options: "i",
        },
      },
      {
        email: {
          $regex: query,
          $options: "i",
        },
      },
    ],
  })
    .select(
      "-emailVerificationExpiry -emailVerificationToken -forgotPasswordExpiry -forgotPasswordToken -refreshToken -password"
    )
    .limit(20);

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "User fetched successfully"));
});

export { findUser };
