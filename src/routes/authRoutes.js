import express from 'express';
import { registerUser, loginUser, googleLogin, firebaseGoogleLogin, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/firebase-google', firebaseGoogleLogin);
router.get('/me', protect, getMe);

export default router;
