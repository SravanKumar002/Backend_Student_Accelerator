import express from 'express';
import { getCourses, getSessions, getTopics } from '../controllers/curriculumController.js';

const router = express.Router();

router.get('/courses', getCourses);
router.get('/courses/:courseName/topics', getTopics);
router.get('/courses/:courseName/sessions', getSessions);

export default router;
