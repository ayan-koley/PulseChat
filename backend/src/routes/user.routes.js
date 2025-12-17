import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { findUser } from '../controllers/user.controllers.js';

const router = Router();


router.route("/search").post(verifyJWT, findUser);

export default router;