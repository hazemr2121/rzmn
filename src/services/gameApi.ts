const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchQuestions(
  token: string,
  sessionId: string,
  categoryId: string,
  apiCategory?: string,
  apiCategoryId?: number,
  difficulty?: string
) {
  const res = await fetch(`${API_URL}/game/fetch-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, categoryId, apiCategory, apiCategoryId, difficulty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch questions");
  return data.data;
}

export async function createGameSession(
  token: string,
  team1: string,
  team2: string,
  categories: { id: string; source: string; name: string; apiCategory?: string }[]
) {
  const res = await fetch(`${API_URL}/game/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ team1, team2, categories }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create session");
  return data.data;
}

export async function getActiveSession(token: string) {
  const res = await fetch(`${API_URL}/game/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}

export async function resumeSession(token: string, sessionId: string) {
  const res = await fetch(`${API_URL}/game/resume/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}

export async function markQuestionUsed(
  token: string,
  sessionId: string,
  categoryId: string,
  questionText: string
) {
  await fetch(`${API_URL}/game/mark-used`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, categoryId, questionText }),
  });
}

export async function updateScore(
  token: string,
  sessionId: string,
  team: number,
  points: number
) {
  const res = await fetch(`${API_URL}/game/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, team, points }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}

export async function endSession(token: string, sessionId: string) {
  const res = await fetch(`${API_URL}/game/end/${sessionId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}

export async function getHistory(token: string) {
  const res = await fetch(`${API_URL}/game/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
}

export async function deleteSession(token: string, sessionId: string) {
  const res = await fetch(`${API_URL}/game/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
}
