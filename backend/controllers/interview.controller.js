const Interview = require('../models/interview.model');
const { generateQuestions, evaluateAnswer } = require('../services/ai.service');

// @desc    Create a new interview
// @route   POST /api/interview/create
// @access  Private
const createInterview = async (req, res, next) => {
  try {
    const { techStack, level } = req.body;
    const userId = req.user._id;

    // Validation
    if (!techStack || !level) {
      return res.status(400).json({
        success: false,
        message: 'Please provide techStack and level',
      });
    }

    const validTechStacks = ['React', 'Node', 'MERN', 'DSA'];
    const validLevels = ['Fresher', '2-3 Years', 'Senior'];

    if (!validTechStacks.includes(techStack)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid techStack. Must be one of: React, Node, MERN, DSA',
      });
    }

    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be one of: Fresher, 2-3 Years, Senior',
      });
    }

    // Generate questions using AI service
    const questionsData = await generateQuestions(techStack, level);

    // Format questions for database
    const questions = questionsData.map((q) => ({
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      userAnswer: '',
      score: 0,
      feedback: '',
    }));

    // Create interview
    const interview = await Interview.create({
      userId,
      techStack,
      level,
      questions,
      status: 'created',
    });

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit interview answers
// @route   POST /api/interview/submit
// @access  Private
const submitInterview = async (req, res, next) => {
  try {
    const { interviewId, answers } = req.body;
    const userId = req.user._id;

    // Validation
    if (!interviewId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide interviewId and answers array',
      });
    }

    // Find interview
    const interview = await Interview.findOne({
      _id: interviewId,
      userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview already completed',
      });
    }

    // Update answers and evaluate each one
    for (let i = 0; i < interview.questions.length; i++) {
      if (answers[i] !== undefined && answers[i] !== null) {
        interview.questions[i].userAnswer = answers[i];

        // Evaluate answer using AI service
        try {
          const evaluation = await evaluateAnswer(
            interview.questions[i].question,
            interview.questions[i].expectedAnswer,
            answers[i]
          );

          interview.questions[i].score = evaluation.score || 0;
          interview.questions[i].feedback = evaluation.feedback || '';
        } catch (evalError) {
          console.error('Error evaluating answer:', evalError);
          // Set default values if evaluation fails
          interview.questions[i].score = 0;
          interview.questions[i].feedback =
            'Unable to evaluate answer. Please try again.';
        }
      }
    }

    // Update status
    interview.status = 'completed';

    // Save interview (pre-save hook will calculate totalScore)
    await interview.save();

    res.status(200).json({
      success: true,
      data: interview,
      message: 'Interview submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .select('-questions.userAnswer -questions.expectedAnswer');

    res.status(200).json({
      success: true,
      data: interviews,
      count: interviews.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  submitInterview,
  getInterviewHistory,
};
