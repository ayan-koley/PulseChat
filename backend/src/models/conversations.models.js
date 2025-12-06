import { model, Schema } from "mongoose";

const conversationsModels = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation = model("Conversation", conversationsModels);
