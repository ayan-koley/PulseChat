import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies["accessToken"];

  if (!token) {
    throw new ApiError(400, "Unauthorized Request");
  }

  try {
    const extractedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(extractedToken._id).select(
      "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("ERROR ON JWT VERIFY ", err.message);
  }
});
