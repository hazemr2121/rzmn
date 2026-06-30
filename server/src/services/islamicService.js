const fs = require('fs');
const path = require('path');

// IslamicQuizAPI database (rn0x/IslamicQuizAPI, sourced from dorar.net).
// Shape: { mainCategories: [{ id, englishName, arabicName, topics: [
//   { name, slug, levelsData: { level1: [...], level2: [...], level3: [...] } } ] }] }
// Each question: { id, q, link, answers: [{ answer, t }] }  (t === 1 => correct).
const DB_PATH = path.join(__dirname, '../../data/islamicQuiz.json');

const LEVEL_BY_DIFF = { easy: 'level1', medium: 'level2', hard: 'level3' };

let cache = null;
function load() {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
  return cache;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// categoryId: numeric mainCategory id (1-6). Returns up to 2 unused questions
// for the requested difficulty, flattened across all topics of that category.
function getIslamicQuestions(categoryId, difficulty, usedQuestions = []) {
  try {
    const db = load();
    const cat = (db.mainCategories || []).find(c => String(c.id) === String(categoryId));
    if (!cat) return [];

    const levelKey = LEVEL_BY_DIFF[difficulty] || 'level1';
    const pool = [];
    for (const topic of cat.topics || []) {
      const questions = (topic.levelsData && topic.levelsData[levelKey]) || [];
      for (const item of questions) {
        const correct = (item.answers || []).find(a => a.t === 1);
        if (!correct) continue;
        pool.push({ q: item.q, a: correct.answer, difficulty });
      }
    }

    const filtered = pool.filter(q => !usedQuestions.includes(q.q));
    return shuffle(filtered).slice(0, 2);
  } catch (error) {
    console.error('getIslamicQuestions error:', error.message);
    return [];
  }
}

module.exports = { getIslamicQuestions };
