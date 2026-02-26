import express from 'express';
import { googleCallback, googleLogin, logout } from '../controllers/auth.controller.ts';
import isAuthenticated from '../middlewares/isAuthenticated.middleware.ts';
const router = express.Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/logout', isAuthenticated, logout);

export default router;
