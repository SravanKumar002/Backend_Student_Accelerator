import express from 'express';
import { getStudentData, createStudentData, updateStudentData, generatePath } from '../controllers/studentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-path', generatePath);

router.route('/me')
    .get(protect, getStudentData)
    .post(protect, createStudentData)
    .put(protect, updateStudentData);

export default router;
