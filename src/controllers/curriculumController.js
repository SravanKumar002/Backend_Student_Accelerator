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

// Correct topic order for each course
const TOPIC_ORDER = {
  "Introduction to Databases": [
    "Introduction to Database",
    "Introduction To SQL",
    "Querying with SQL",
    "Querying with SQL - 2",
    "Aggregations and Group By",
    "Group By with Having",
    "SQL Expressions and Functions",
    "SQL Case Clause and Set Operations",
    "Modelling Databases",
    "Joins",
    "Querying with Joins",
    "Views and Subqueries",
    "SQL Course Quiz"
  ],
  "Programming Foundations": [
    "Introduction to Python",
    "I/O Basics",
    "Operators & Conditional Statements",
    "Nested Conditions",
    "Loops",
    "Loop Control Statements",
    "Comparing Strings & Naming Variables",
    "Lists",
    "Functions",
    "Recursion",
    "Tuples & Sets",
    "Dictionaries",
    "Introduction to Object Oriented Programming",
    "Miscellaneous Topics",
    "Revision",
    "NxtMock - Your AI Interviewer",
    "Programming Foundations Course Exam"
  ],
  "Build Your Own Static Website": [
    "Introduction to HTML",
    "HTML Hyperlinks",
    "Introduction to HTML5 & HTML Semantic Elements",
    "Introduction to CSS",
    "Intro to CSS & CSS Box Model",
    "CSS Box Model & Intro to Bootstrap",
    "Introduction to Bootstrap & Developing Layouts",
    "Developing Layouts",
    "Website Integration",
    "Industry Readiness",
    "Revision",
    "Build Your Own Static Website Course Quiz"
  ],
  "Build Your Own Responsive Website": [
    "Introduction to Responsive Design",
    "Media Queries",
    "Flexbox",
    "CSS Grid",
    "Bootstrap Basics",
    "Bootstrap Components",
    "Bootstrap Layouts",
    "Responsive Layouts"
  ],
  "Modern Responsive Web Design": [
    "Introduction",
    "Typography",
    "Colors",
    "Layout",
    "Components",
    "Utilities",
    "Forms",
    "Project"
  ],
  "Build Your Own Dynamic Web Application": [
    "Introduction to JS & Variables",
    "Arrays and Objects",
    "Todos Application",
    "Todos Application 2",
    "Todos Application 3",
    "Todos Application 4",
    "Fetch & Callbacks",
    "Fetch & Callbacks 2",
    "Forms",
    "Assignments",
    "Mock Tests",
    "Build Your Own Dynamic Web Application Course Exam"
  ],
  "Node JS": [
    "MERN Stack and CCBP IDE",
    "Introduction to Node JS",
    "Introduction to Express JS",
    "REST APIs",
    "Authentication",
    "Assignments",
    "Mock Tests",
    "Node JS Course Exam"
  ],
  "Introduction to React JS": [
    "Introduction to React JS and States",
    "Introduction to State Hook",
    "Effect Hook and Rules of Hooks",
    "Routing using React Router",
    "React Context",
    "Authentication & Authorization",
    "Course Quiz"
  ],
  "Generative AI": [
    "Introduction to AI",
    "Prompt Engineering",
    "LLM Basics",
    "API Integration",
    "RAG Basics",
    "Building Apps"
  ],
  "DSA Foundation": [
    "Introduction to DSA",
    "Time Complexity",
    "Space Complexity",
    "Arrays",
    "Strings",
    "Searching",
    "Sorting",
    "Recursion"
  ],
  "Phase 1 : Data Structures and Algorithms": [
    "Introduction",
    "Arrays",
    "Strings",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Trees",
    "Binary Search Trees",
    "Heaps",
    "Hashing"
  ],
  "Phase 2 : Advanced DSA": [
    "Graphs",
    "Dynamic Programming",
    "Greedy Algorithms",
    "Backtracking",
    "Divide and Conquer",
    "Advanced Trees",
    "Trie",
    "Segment Trees"
  ]
};

// Get topic order index for sorting
function getTopicOrderIndex(courseName, topic) {
  const courseTopics = TOPIC_ORDER[courseName];
  if (!courseTopics) return 999; // Unknown course, put at end
  
  const index = courseTopics.findIndex(t => 
    t.toLowerCase() === topic?.toLowerCase() ||
    topic?.toLowerCase().includes(t.toLowerCase()) ||
    t.toLowerCase().includes(topic?.toLowerCase())
  );
  
  return index >= 0 ? index : 999;
}

// Session type priority for ordering within a topic
const SESSION_TYPE_ORDER = {
  'LEARNING_SET': 1,
  'QUIZ': 2,
  'PRACTICE': 3,
  'QUESTION_SET': 4,
  'EXAM': 5,
  'ASSESSMENT': 6,
  'PROJECT': 7
};

// Get session order within a topic based on session name patterns
function getSessionNameOrder(sessionName) {
  const name = sessionName?.toLowerCase() || '';
  
  // Main topic video/content comes first
  if (!name.includes('|') && !name.includes('reading material') && !name.includes('quiz') && 
      !name.includes('practice') && !name.includes('coding') && !name.includes('mcq') &&
      !name.includes('daily') && !name.includes('classroom')) {
    return 0;
  }
  // Reading material comes after main content
  if (name.includes('reading material')) return 1;
  // Cheat sheet
  if (name.includes('cheat sheet')) return 2;
  // Classroom Quiz A, B, C
  if (name.includes('classroom quiz a')) return 3;
  if (name.includes('classroom quiz b')) return 4;
  if (name.includes('classroom quiz c')) return 5;
  // MCQ Practice
  if (name.includes('mcq practice')) return 6;
  // Coding Practice
  if (name.includes('coding practice')) return 7;
  // Daily Quiz
  if (name.includes('daily quiz')) return 8;
  // Other quizzes
  if (name.includes('quiz')) return 9;
  // Practice
  if (name.includes('practice')) return 10;
  
  return 50; // Default for unknown patterns
}

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

// @desc    Get topics for a specific course in correct order
// @route   GET /api/curriculum/courses/:courseName/topics
// @access  Public
export const getTopics = async (req, res) => {
  try {
    const { courseName } = req.params;
    const topics = await Curriculum.distinct("topic", { courseName });
    
    // Sort topics according to predefined order
    const sortedTopics = topics.sort((a, b) => {
      return getTopicOrderIndex(courseName, a) - getTopicOrderIndex(courseName, b);
    });
    
    res.status(200).json(sortedTopics);
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
    
    // Sort sessions by topic order first, then by session name order within topic
    const sortedSessions = sessionsWithDurations.sort((a, b) => {
      const topicOrderA = getTopicOrderIndex(courseName, a.topic);
      const topicOrderB = getTopicOrderIndex(courseName, b.topic);
      
      if (topicOrderA !== topicOrderB) {
        return topicOrderA - topicOrderB;
      }
      
      // Within same topic, sort by session name pattern
      const sessionOrderA = getSessionNameOrder(a.sessionName);
      const sessionOrderB = getSessionNameOrder(b.sessionName);
      
      if (sessionOrderA !== sessionOrderB) {
        return sessionOrderA - sessionOrderB;
      }
      
      // If same pattern, use sequence number as tiebreaker
      return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
    });

    res.status(200).json(sortedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
