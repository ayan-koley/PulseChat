import { asyncHandler } from "../utils/async-handler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import { User } from "../models/user.models.js";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
  changePasswordPostRequestBodySchema,
} from "../validators/request.validation.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const validationOnResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body
  );
  if (validationOnResult.error) {
    throw new ApiError(
      400,
      validationOnResult.error.message,
      validationOnResult.error.format
    );
  }

  const { username, fullName, password, email } = validationOnResult.data;

  const existenceUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existenceUser) {
    throw new ApiError(400, "User is already SignUp");
  }

  const user = await User.create({ username, fullName, email, password });

  if (!user) {
    throw new ApiError(500, "Server is failure to create user");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailGenContent: emailVerificationMailgenContent({
      username: user.username,
      verificationUrl: `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    }),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registration successfully and verification email has been sent on your email"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const validationOnResult = await loginPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (validationOnResult.error) {
    throw new ApiError(
      400,
      validationOnResult.error.message,
      validationOnResult.error.format
    );
  }

  const { username, email, password } = validationOnResult.data;

  if (
    (!username || username.trim() === "") &&
    (!email || email.trim() === "")
  ) {
    throw new ApiError(
      400,
      "Please provide either a username or an email to continue."
    );
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(
      404,
      "No account found with the provided username or email."
    );
  }

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "The password you entered is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"
  );

  // const options = {
  //     httpOnly: true,
  //     secure: true
  // }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful. Welcome back!"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndUpdate(user._id, {
    $set: {
      refreshToken: "",
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "Current user fetched successfully"
    )
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const validateOnRequest =
    await changePasswordPostRequestBodySchema.safeParseAsync(req.body);

  if (validateOnRequest.error) {
    throw new ApiError(
      400,
      validateOnRequest.error.message,
      validateOnRequest.error.format
    );
  }

  const { currentPassword, newPassword } = validateOnRequest.data;

  const user = req.user;

  const c_user = await User.findById(user._id);

  const isPassCorrect = c_user.isPasswordCorrect(currentPassword);

  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  await User.findByIdAndUpdate(c_user._id, {
    $set: {
      password: newPassword,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Update Successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is misssing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOneAndUpdate(
    {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    },
    {
      $set: { isEmailVarified: true },
      $unset: { emailVerificationToken: "", emailVerificationExpiry: "" },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(400, "Email verification token is misssing or expire");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const c_user = await User.findById(req.user._id);

  if (c_user.isEmailVarified) {
    throw new ApiError(400, "Email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    c_user.generateTemporaryToken();

  c_user.emailVerificationToken = hashedToken;
  c_user.emailVerificationExpiry = tokenExpiry;

  await c_user.save({ validateBeforeSave: false });

  sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailGenContent: emailVerificationMailgenContent({
      username: c_user.username,
      verificationUrl: `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    }),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Resand verification token to email"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies["refreshToken"];

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is missing");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(400, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: true });

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message, error);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Invalid email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User is not found");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  sendEmail({
    email: user.email,
    subject: "Forgot Password",
    mailGencontent: forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/user/reset-password/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset email has been resent. Please check your inbox."
      )
    );
});

const verifyForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword?.length < 4) {
    throw new ApiError(400, "Password length is greater then 4");
  }

  if (!resetToken) {
    throw new ApiError(400, "Invalid password reset token");
  }

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedResetToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid password reset token or expire");
  }

  user.password = newPassword;
  user.forgotPasswordToken = "";
  user.forgotPasswordExpiry = "";
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  getCurrentUser,
  changePassword,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPassword,
  verifyForgotPassword,
};
