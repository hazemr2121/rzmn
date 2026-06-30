const axios = require("axios");

const TRIVIA_API = "https://the-trivia-api.com/v2/questions";
const OPENTDB_API = "https://opentdb.com/api.php";

async function fetchQuestionsForCategory(apiCategory, difficulty, usedQuestions = []) {
  try {
    const params = {
      categories: apiCategory,
      difficulties: difficulty,
      limit: 10,
      types: "text_choice",
    };

    const res = await axios.get(TRIVIA_API, { params, timeout: 15000 });
    const questions = res.data || [];

    const filtered = questions
      .filter(q => !usedQuestions.includes(q.question.text))
      .slice(0, 2)
      .map(q => ({
        q: q.question.text,
        a: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer,
        wrongAnswers: q.incorrectAnswers || [],
        difficulty: q.difficulty,
      }));

    return filtered;
  } catch (error) {
    console.error(`Failed to fetch trivia-api ${apiCategory}/${difficulty}:`, error.message);
    return [];
  }
}

async function fetchOpenTDBQuestions(apiCategoryId, difficulty, usedQuestions = []) {
  try {
    const params = {
      amount: 10,
      category: apiCategoryId,
      difficulty,
      type: "multiple",
      encode: "url3986",
    };

    const res = await axios.get(OPENTDB_API, { params, timeout: 15000 });
    const data = res.data;

    if (data.response_code === 0 && data.results) {
      const filtered = data.results
        .filter(q => !usedQuestions.includes(q.question))
        .slice(0, 2)
        .map(q => ({
          q: decodeURIComponent(q.question),
          a: decodeURIComponent(q.correct_answer),
          wrongAnswers: q.incorrect_answers.map(a => decodeURIComponent(a)),
          difficulty,
        }));

      return filtered;
    }
    return [];
  } catch (error) {
    console.error(`Failed to fetch opentdb ${apiCategoryId}/${difficulty}:`, error.message);
    return [];
  }
}

async function fetchAllCategoryQuestions(categories, usedQuestionsMap = {}) {
  const apiCats = categories.filter((c) => c.source === "api" && c.apiCategory);
  if (apiCats.length === 0) return {};

  const results = {};
  for (const cat of apiCats) {
    results[cat.id] = { easy: [], medium: [], hard: [] };
  }

  return results;
}

module.exports = { fetchAllCategoryQuestions, fetchQuestionsForCategory, fetchOpenTDBQuestions };
