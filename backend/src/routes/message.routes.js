import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getMessagesOfaConversation } from "../controllers/message.controllers.js";

const router = Router();

router.route("/:conversationId").get(verifyJWT, getMessagesOfaConversation);

export default router;
