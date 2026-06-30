const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createSession,
  getActiveSession,
  resumeSession,
  fetchQuestions,
  markQuestionUsed,
  updateScore,
  endSession,
  getHistory,
  deleteSession,
} = require('../controllers/gameController');

const router = express.Router();

router.use(protect);

router.post('/create', [
  body('team1').notEmpty(),
  body('team2').notEmpty(),
  body('categories').isArray({ min: 6, max: 6 }),
], createSession);

router.get('/active', getActiveSession);
router.get('/resume/:sessionId', resumeSession);
router.post('/fetch-questions', fetchQuestions);
router.post('/mark-used', markQuestionUsed);
router.post('/score', updateScore);
router.put('/end/:sessionId', endSession);
router.get('/history', getHistory);
router.delete('/:sessionId', deleteSession);

module.exports = router;
