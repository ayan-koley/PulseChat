import { Schema, model } from "mongoose";

const messageModel = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = model("Message", messageModel);
