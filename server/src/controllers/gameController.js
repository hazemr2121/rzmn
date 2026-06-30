const GameSession = require('../models/GameSession');
const { fetchAllCategoryQuestions, fetchQuestionsForCategory, fetchOpenTDBQuestions } = require('../services/triviaService');
const { getIslamicQuestions } = require('../services/islamicService');

const createSession = async (req, res) => {
  try {
    const { team1, team2, categories } = req.body;

    if (!team1 || !team2 || !categories || categories.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid game setup' });
    }

    const session = await GameSession.create({
      userId: req.user._id,
      team1,
      team2,
      categories,
    });

    const apiCats = categories.filter(c => c.source === 'api' && c.apiCategory);
    if (apiCats.length > 0) {
      session.apiQuestions = {};
      await session.save();
    }

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('createSession error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getActiveSession = async (req, res) => {
  try {
    const session = await GameSession.findOne({
      userId: req.user._id,
      status: 'active',
    }).sort({ updatedAt: -1 });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const resumeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active',
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const fetchQuestions = async (req, res) => {
  try {
    const { sessionId, categoryId, apiCategory, apiCategoryId, difficulty } = req.body;

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const catConfig = session.categories.find(c => c.id === categoryId);
    if (!catConfig) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const used = session.questionsUsed[categoryId] || [];
    let questions = [];

    if (catConfig.source === 'api' && apiCategory) {
      questions = await fetchQuestionsForCategory(apiCategory, difficulty, used);
    } else if (catConfig.source === 'opentdb' && apiCategoryId) {
      questions = await fetchOpenTDBQuestions(apiCategoryId, difficulty, used);
    } else if (catConfig.source === 'islamic' && apiCategoryId) {
      questions = getIslamicQuestions(apiCategoryId, difficulty, used);
    }

    if (!session.apiQuestions[categoryId]) {
      session.apiQuestions[categoryId] = {};
    }
    if (!session.apiQuestions[categoryId][difficulty]) {
      session.apiQuestions[categoryId][difficulty] = [];
    }
    session.apiQuestions[categoryId][difficulty] = questions;

    for (const q of questions) {
      if (!session.questionsUsed[categoryId]) {
        session.questionsUsed[categoryId] = [];
      }
      if (!session.questionsUsed[categoryId].includes(q.q)) {
        session.questionsUsed[categoryId].push(q.q);
      }
    }
    await session.save();

    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('fetchQuestions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markQuestionUsed = async (req, res) => {
  try {
    const { sessionId, categoryId, questionText } = req.body;

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (!session.questionsUsed[categoryId]) {
      session.questionsUsed[categoryId] = [];
    }
    if (!session.questionsUsed[categoryId].includes(questionText)) {
      session.questionsUsed[categoryId].push(questionText);
    }
    await session.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateScore = async (req, res) => {
  try {
    const { sessionId, team, points } = req.body;

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const teamKey = team === 1 ? 'team1' : 'team2';
    session.scores[teamKey] += points;
    session.currentTeam = team === 1 ? 2 : 1;
    await session.save();

    res.json({ success: true, data: { scores: session.scores, currentTeam: session.currentTeam } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findOneAndUpdate(
      { _id: sessionId, userId: req.user._id },
      { status: 'completed' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const sessions = await GameSession.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('-questionsUsed -apiQuestions');

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findOneAndDelete({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSession,
  getActiveSession,
  resumeSession,
  fetchQuestions,
  markQuestionUsed,
  updateScore,
  endSession,
  getHistory,
  deleteSession,
};
