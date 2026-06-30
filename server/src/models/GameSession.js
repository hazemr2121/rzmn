const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  categories: [{
    id: String,
    source: { type: String, enum: ['local', 'api', 'opentdb', 'islamic'], required: true },
    name: String,
    apiCategory: String,
    apiCategoryId: Number,
  }],
  scores: {
    team1: { type: Number, default: 0 },
    team2: { type: Number, default: 0 },
  },
  currentTeam: { type: Number, enum: [1, 2], default: 1 },
  questionsUsed: { type: Object, default: {} },
  apiQuestions: { type: Object, default: {} },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

gameSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
