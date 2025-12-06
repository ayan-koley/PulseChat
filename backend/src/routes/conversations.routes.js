import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createOrGetConversation,
  listUserConversation,
} from "../controllers/conversation.controllers.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(listUserConversation);
router.route("/:otherUserId").post(createOrGetConversation);

export default router;
