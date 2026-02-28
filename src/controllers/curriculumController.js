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
    "Sequence of Instructions",
    "Type Conversions",
    "Logical Operators & Conditonal Statements",
    "Nested Conditional Statements & Loops",
    "For Loop",
    "Nested Loops & Problem Solving",
    "Loop Control Statements & Problem Solving",
    "Problem Solving",
    "Lists",
    "Lists - 2",
    "List Methods and Tuples",
    "Nested Lists and String Formatting",
    "Comparing Strings & Naming Variables",
    "String Methods & Problem Solving and Debugging - 3",
    "Dictionaries",
    "Sets and Set Operations",
    "Functions",
    "Scopes and Python Libraries",
    "Built-in Functions & Recursions",
    "Problem Solving using Recursion",
    "Problem Solving and Built-in Functions",
    "Understanding OOPs",
    "Object Oriented Programming",
    "Encapsulation and Inheritance",
    "Abstraction and Polymorphism",
    "Error Handling and DateTime",
    "More Python Concepts",
    "Problem Solving and Debugging",
    "Understanding Coding Question Formats",
    "Intro to Matrices & Shorthand expressions",
    "Revision",
    "Programming Foundations Course Quiz"
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
    "Introduction to Dynamic Web Applications",
    "Introduction to JS & Variables",
    "Arrays & Objects",
    "Forms",
    "Fetch & Callbacks",
    "Fetch & Callbacks 2",
    "Fetch & Callbacks 3",
    "More Web Concepts",
    "Revision"
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
    
    // Sort sessions by topic order first, then by sequence number
    const sortedSessions = sessionsWithDurations.sort((a, b) => {
      const topicOrderA = getTopicOrderIndex(courseName, a.topic);
      const topicOrderB = getTopicOrderIndex(courseName, b.topic);
      
      if (topicOrderA !== topicOrderB) {
        return topicOrderA - topicOrderB;
      }
      
      // Within same topic, sort by sequence number
      return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
    });

    res.status(200).json(sortedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
