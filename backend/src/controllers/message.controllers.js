import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { Conversation } from "../models/conversations.models.js";
import { Message } from "../models/message.models.js";

const getMessagesOfaConversation = asyncHandler(async (req, res) => {
  // Endpoint: GET /api/messages/:conversationId
  // Auth required.
  // User must be participant.
  // Returns messages sorted by createdAt (ASC).

  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "Missing conversation id");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const messages = await Message.find({
    conversation: conversationId,
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages },
        "Fetched all messages of this conversations"
      )
    );
});

export { getMessagesOfaConversation };
