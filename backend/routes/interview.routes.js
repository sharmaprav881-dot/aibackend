const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createInterview,
  submitInterview,
  getInterviewHistory,
} = require('../controllers/interview.controller');

router.post('/create', protect, createInterview);
router.post('/submit', protect, submitInterview);
router.get('/history', protect, getInterviewHistory);

module.exports = router;
