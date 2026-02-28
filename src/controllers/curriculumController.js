import Curriculum from "../models/Curriculum.js";

// Default durations by Set Type (in minutes)
// Used when duration is not provided in CSV
const DEFAULT_DURATIONS = {
  LEARNING_SET: 18, // Share sheets: 15-20 mins (avg 18)
  PRACTICE: 60, // Coding: 1 hour (priority)
  QUESTION_SET: 60, // Coding questions: 1 hour
  QUIZ: 12, // MCQs: 10-15 mins (avg 12)
  EXAM: 15, // MCQ Exams: 10-15 mins
  ASSESSMENT: 30, // Assessments: 30 mins
  PROJECT: 120, // Projects: 2 hours
};

// Apply default duration if not provided
function applyDefaultDuration(session) {
  if (!session.durationMins || session.durationMins <= 0) {
    const setType = session.setType || "LEARNING_SET";
    session.durationMins = DEFAULT_DURATIONS[setType] || 15;
  }
  return session;
}

// @desc    Get all unique courses
// @route   GET /api/curriculum/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Curriculum.distinct("courseName");
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
    const sessions = await Curriculum.find({ courseName }).sort({
      sequenceNumber: 1,
    });

    // Apply default durations for sessions without duration
    const sessionsWithDurations = sessions.map((session) => {
      const sessionObj = session.toObject();
      return applyDefaultDuration(sessionObj);
    });

    res.status(200).json(sessionsWithDurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
