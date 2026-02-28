import Curriculum from '../models/Curriculum.js';

// @desc    Get all unique courses
// @route   GET /api/curriculum/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const courses = await Curriculum.distinct('courseName');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sessions for a specific course
// @route   GET /api/curriculum/courses/:courseName/sessions
// @access  Public
export const getSessions = async (req, res) => {
    try {
        const { courseName } = req.params;
        const sessions = await Curriculum.find({ courseName }).sort({ sequenceNumber: 1 });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
