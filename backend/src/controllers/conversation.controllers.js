import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { Conversation } from "../models/conversations.models.js";

const createOrGetConversation = asyncHandler(async (req, res) => {
  // Endpoint: POST /api/conversations/:otherUserId
  // Auth required.
  // If conversation with these two participants exists → return it.
  // Else create new conversation.

  const { otherUserId } = req.params;

  const secondUser = await User.findById(otherUserId);

  if (!secondUser) {
    throw new ApiError(404, "Invalid userId");
  }

  const existingConversation = await Conversation.findOne({
    participants: {
      $all: [req.user._id, secondUser._id],
      $size: 2,
    },
    isGroup: false,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username avatar")
    .populate("lastMessage");

  if (existingConversation) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { conversation: existingConversation },
          "Conversation already exists"
        )
      );
  }

  const newConversation = await Conversation.create({
    participants: [req.user._id, secondUser._id],
    isGroup: false,
  });

  const populatedConversation = await newConversation.populate(
    "participants",
    "username avatar"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { conversation: populatedConversation },
        "New conversation created"
      )
    );
});

const listUserConversation = asyncHandler(async (req, res) => {
  const listConversations = await Conversation.find({
    participants: req.user._id,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username avatar")
    .populate("lastMessage");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { listConversations }, "Fetched all conversations")
    );
});

export { createOrGetConversation, listUserConversation };
