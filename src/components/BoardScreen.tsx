import { useEffect, useRef, useState } from "react";
import type { Difficulty, GameConfig, PowerUps, Question, Scores, SelectedCategory } from "../types";
import { CATEGORIES, DIFF_COLOR, DIFF_LABEL, POINTS } from "../data/categories";
import { API_CATEGORIES } from "../data/apiCategories";
import { OPENTDB_CATEGORIES } from "../data/opentdbCategories";
import { ISLAMIC_CATEGORIES } from "../data/islamicCategories";
import { createGameSession, fetchQuestions, markQuestionUsed, updateScore, endSession } from "../services/gameApi";
import { useAuth } from "../context/AuthContext";

type Phase = "board" | "question" | "reveal";
interface ActiveCell {
  catId: string;
  difficulty: Difficulty;
  question: Question;
  points: number;
  slot: number;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CSS = `
  /* ══════════════ BASE ══════════════ */
  .bl-root { min-height:100vh; min-height:100dvh; background:var(--bg); display:flex; flex-direction:column; }

  .bl-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 14px; gap:8px;
    border-bottom:1px solid rgba(255,255,255,0.07);
    background:rgba(8,12,20,0.97); backdrop-filter:blur(14px);
    position:sticky; top:0; z-index:30;
  }
  .bl-logo {
    font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:3px;
    background:linear-gradient(135deg,#f0c040,#e07b20);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    white-space:nowrap; flex-shrink:0;
  }
  .bl-badge {
    flex:1; text-align:center;
    background:rgba(240,192,64,0.12); border:1px solid rgba(240,192,64,0.3);
    border-radius:20px; padding:5px 10px; font-size:12px; font-weight:700;
    color:var(--accent); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .bl-endbtn {
    flex-shrink:0; background:transparent; border:1px solid rgba(224,60,60,0.35);
    border-radius:10px; padding:6px 10px; color:#e03c3c; font-size:11px;
    font-weight:700; cursor:pointer; white-space:nowrap; transition:background .2s;
  }
  .bl-endbtn:hover { background:rgba(224,60,60,0.12); }

  /* ══════════════ DESKTOP: teams on sides, cats center ══════════════ */
  .bl-board-grid {
    display:grid; grid-template-columns:200px 1fr 200px; gap:10px; padding:8px 12px 12px;
    align-items:center; min-height:calc(100vh - 58px);
  }
  .bl-side {
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;
  }
  .bl-team {
    width:100%; max-width:200px; max-height:240px;
    border-radius:16px; padding:16px 12px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    text-align:center; display:flex; flex-direction:column; align-items:center; gap:4px;
    transition:border-color .3s, background .3s, box-shadow .3s;
  }
  .bl-team.on {
    border-color:rgba(240,192,64,0.5); background:rgba(240,192,64,0.07);
    box-shadow:0 0 28px rgba(240,192,64,0.13);
  }
  .bl-t-label { font-size:10px; color:var(--muted); letter-spacing:1px; }
  .bl-t-name  { font-size:14px; font-weight:800; color:#e8f0ff; word-break:break-word; line-height:1.2; }
  .bl-t-score { font-family:'Bebas Neue',sans-serif; font-size:48px; line-height:1; color:#fff; transition:color .3s; }
  .bl-team.on .bl-t-score { color:var(--accent); }
  .bl-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); animation:pulse 1.5s ease-in-out infinite; }
  .bl-pu { display:grid; gap:5px; width:100%; margin-top:6px; }
  .bl-pu-btn {
    padding:7px 6px; border-radius:10px; font-size:11px; font-weight:800;
    border:1px solid; cursor:pointer; transition:all .2s; line-height:1.3;
  }
  .bl-pu-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* Desktop cats */
  .bl-cats-desk { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:0 6px 16px; }

  /* Desktop card */
  .bl-card-desk {
    border-radius:12px; overflow:hidden;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    display:flex; flex-direction:column;
  }
  .bl-pt-row { display:grid; grid-template-columns:1fr 1fr; gap:3px; padding:3px 3px 0; }
  .bl-pt-row:last-child { padding-bottom:3px; }

  /* ══════════════ SHARED: point cell ══════════════ */
  .bl-cell {
    border-radius:6px; border:1.5px solid;
    font-family:'Bebas Neue',sans-serif; letter-spacing:1px;
    cursor:pointer; text-align:center;
    transition:all .15s; line-height:1;
  }
  .bl-cell:hover:not(:disabled) { transform:scale(1.08); filter:brightness(1.3); }
  .bl-cell.used { cursor:not-allowed !important; transform:none !important; filter:none !important; }

  /* Desktop cell size */
  .bl-cell { font-size:14px; padding:7px 2px; }

  /* Desktop cat image */
  .bl-cat-img { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; flex-shrink:0; }
  .bl-cat-img img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .4s; }
  .bl-cat-ov {
    position:absolute; inset:0;
    background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(8,12,20,0.88) 75%);
    pointer-events:none;
  }
  .bl-cat-label { position:absolute; bottom:0; left:0; right:0; padding:5px 6px 7px; text-align:center; }
  .bl-cat-emoji-d { font-size:16px; display:block; line-height:1; }
  .bl-cat-name-d  { font-size:10px; font-weight:800; color:#e8f0ff; margin-top:2px; }

  /* ══════════════ MOBILE: rkz-style ══════════════ */
  /* hide desktop elements on mobile */
  @media (max-width:699px) {
    .bl-board-grid { display:none; }
    .bl-cats-desk  { display:none; }
  }
  /* hide mobile elements on desktop */
  @media (min-width:700px) {
    .bl-mob-cats   { display:none !important; }
    .bl-mob-scores { display:none !important; }
  }

  @media (max-width:1024px) {
    .bl-board-grid { grid-template-columns:170px 1fr 170px; }
  }

  /* Mobile cats grid */
  .bl-mob-cats {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:6px;
    padding:6px 8px 120px;
    flex:1;
    overflow-y:auto;
    align-content:start;
  }

  /* Mobile scores bar — fixed at bottom */
  .bl-mob-scores {
    position:fixed; bottom:0; left:0; right:0; z-index:25;
    display:flex; gap:0;
    background:rgba(8,12,20,0.97); backdrop-filter:blur(14px);
    border-top:1px solid rgba(255,255,255,0.08);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  /* Mobile card — image fills, buttons on left+right columns */
  .bl-mob-card {
    display:grid;
    grid-template-columns:30px 1fr 30px;
    gap:3px;
    align-items:center;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;
    overflow:hidden;
    min-height:90px;
  }

  /* side column of buttons */
  .bl-mob-col {
    display:flex; flex-direction:column; gap:3px;
    padding:3px 2px;
    align-self:stretch; justify-content:center;
  }

  /* mobile cell */
  .bl-mob-cell {
    border-radius:5px; border:1.5px solid;
    font-family:'Bebas Neue',sans-serif; font-size:10px; letter-spacing:.5px;
    padding:5px 1px; cursor:pointer; text-align:center;
    transition:all .15s; line-height:1; flex:1;
  }
  .bl-mob-cell:hover:not(:disabled) { filter:brightness(1.3); }
  .bl-mob-cell.used { cursor:not-allowed; filter:none !important; }

  /* mobile cat image centre */
  .bl-mob-img {
    position:relative; width:100%; height:100%;
    min-height:90px; overflow:hidden;
  }
  .bl-mob-img img {
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  }
  .bl-mob-ov {
    position:absolute; inset:0;
    background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(8,12,20,0.82) 75%);
  }
  .bl-mob-label {
    position:absolute; bottom:0; left:0; right:0;
    padding:3px 4px 5px; text-align:center;
  }
  .bl-mob-emoji { font-size:13px; display:block; line-height:1; }
  .bl-mob-name  { font-size:8px; font-weight:800; color:#e8f0ff; margin-top:1px; line-height:1.1; }

  .bl-mob-team {
    flex:1; display:flex; flex-direction:column; align-items:center;
    padding:8px 8px 10px; gap:2px; transition:background .3s;
  }
  .bl-mob-team.on { background:rgba(240,192,64,0.08); }
  .bl-mob-divider { width:1px; background:rgba(255,255,255,0.08); flex-shrink:0; }
  .bl-mob-t-label { font-size:9px; color:var(--muted); letter-spacing:1px; }
  .bl-mob-t-name  { font-size:11px; font-weight:800; color:#e8f0ff; }
  .bl-mob-t-score { font-family:'Bebas Neue',sans-serif; font-size:32px; line-height:1; }
  .bl-mob-team.on .bl-mob-t-score { color:var(--accent); }
  .bl-mob-t-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:pulse 1.5s ease-in-out infinite; }
  .bl-mob-pus { display:flex; gap:4px; margin-top:3px; }
  .bl-mob-pu-btn {
    padding:4px 6px; border-radius:8px; font-size:8px; font-weight:800;
    border:1px solid; cursor:pointer; transition:all .2s; line-height:1.2; white-space:nowrap;
  }
  .bl-mob-pu-btn:disabled { opacity:.32; cursor:not-allowed; }

  /* ══════════════ QUESTION / REVEAL ══════════════ */
  .bl-q-wrap {
    min-height:100vh; background:var(--bg);
    display:flex; flex-direction:column; padding:16px;
    animation:fadeUp .35s ease;
  }
  .bl-q-inner { max-width:540px; margin:0 auto; width:100%; flex:1; display:flex; flex-direction:column; }
  .bl-q-purow { display:flex; gap:8px; margin-bottom:14px; }
  .bl-q-pu {
    flex:1; padding:9px 4px; border-radius:12px; font-size:11px;
    font-weight:700; border:1px solid; cursor:pointer; transition:all .2s;
  }
  .bl-q-pu:disabled { opacity:.35; cursor:not-allowed; }
  .bl-tagrow { display:flex; gap:8px; justify-content:center; margin-bottom:14px; flex-wrap:wrap; }
  .bl-tag { border-radius:30px; padding:5px 14px; font-size:12px; font-weight:700; }
  .bl-timer-c { display:flex; justify-content:center; margin-bottom:10px; }
  .bl-q-text {
    background:rgba(255,255,255,0.05); border:1px solid var(--border);
    border-radius:18px; padding:22px 18px; font-size:19px; font-weight:700;
    line-height:1.65; text-align:center; color:#f0f4ff; margin-bottom:18px;
    flex:1; display:flex; align-items:center; justify-content:center; direction:rtl;
  }
  .bl-q-img {
    margin:0 auto 14px; border-radius:14px; overflow:hidden;
    border:1px solid rgba(255,255,255,0.1); max-width:100%;
    aspect-ratio:16/9; background:rgba(0,0,0,0.25);
  }
  .bl-q-img img { width:100%; height:100%; object-fit:contain; }
  .bl-rev-btn {
    width:100%; padding:16px; border:none; border-radius:14px;
    background:linear-gradient(135deg,#1f2a44,#111827); color:#fff;
    font-size:16px; font-weight:800; cursor:pointer; transition:filter .2s;
  }
  .bl-rev-btn:hover { filter:brightness(1.15); }
  .bl-rv-wrap { min-height:100vh; padding:20px 16px; background:var(--bg); animation:revealSlide .4s ease; }
  .bl-rv-inner { max-width:540px; margin:0 auto; }
  .bl-ans-box { border-radius:18px; padding:22px 16px; font-size:22px; font-weight:900; text-align:center; margin-bottom:10px; }
  .bl-vrow { display:flex; gap:10px; margin-bottom:14px; }
  .bl-vbtn { flex:1; padding:16px; border:none; border-radius:14px; color:#fff; font-size:16px; font-weight:800; cursor:pointer; transition:filter .2s; }
  .bl-vbtn:hover { filter:brightness(1.12); }
  .bl-nxtbtn { width:100%; padding:16px; border:none; border-radius:14px; background:linear-gradient(135deg,#1f2a44,#111827); color:#fff; font-size:16px; font-weight:800; cursor:pointer; margin-bottom:14px; }
`;

export default function BoardScreen({ config, onEnd }: { config: GameConfig; onEnd: (s: Scores) => void }) {
  const { user } = useAuth();
  const gameSeed = useRef(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fetchingCells, setFetchingCells] = useState<Set<string>>(new Set());

  const questionPools = useRef<Record<string, Record<Difficulty, Question[]>>>({});
  const fetchedRefs = useRef<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      // Seed the per-game shuffle once, at mount (kept out of render to stay pure).
      if (!gameSeed.current) gameSeed.current = Date.now();
      const pools: Record<string, Record<Difficulty, Question[]>> = {};

      for (const cat of config.sharedCats) {
        pools[cat.id] = { easy: [], medium: [], hard: [] };

        if (cat.source === "local") {
          const localCat = CATEGORIES.find(c => c.id === cat.id);
          if (!localCat?.questions) continue;
          (["easy", "medium", "hard"] as Difficulty[]).forEach(diff => {
            const qs = localCat.questions!.filter(q => q.difficulty === diff);
            pools[cat.id][diff] = seededShuffle(qs, gameSeed.current + cat.id.charCodeAt(0) * 31 + diff.length);
          });
        }
      }

      questionPools.current = pools;

      if (user?.token) {
        try {
          const session = await createGameSession(
            user.token,
            config.team1,
            config.team2,
            config.sharedCats.map(c => ({ id: c.id, source: c.source, name: c.name, apiCategory: c.apiCategory, apiCategoryId: c.apiCategoryId }))
          );
          setSessionId(session._id);
        } catch (err) {
          console.error('createGameSession error:', err);
        }
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryData = (cat: SelectedCategory) => {
    if (cat.source === "local") return CATEGORIES.find(c => c.id === cat.id);
    if (cat.source === "opentdb") return OPENTDB_CATEGORIES.find(c => c.id === cat.id);
    if (cat.source === "islamic") return ISLAMIC_CATEGORIES.find(c => c.id === cat.id);
    return API_CATEGORIES.find(c => c.id === cat.id);
  };

  const diffs: Difficulty[] = ["easy", "medium", "hard"];

  // Seconds on the clock per question — hard (900 pts) gets more time.
  const questionTime = (diff: Difficulty) => (diff === "hard" ? 90 : 60);

  const [scores, setScores]           = useState<Scores>({ team1: 0, team2: 0 });
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1);
  const [phase, setPhase]             = useState<Phase>("board");
  const [active, setActive]           = useState<ActiveCell | null>(null);
  const [usedMap, setUsedMap]         = useState<Record<string, Set<number>>>({});
  const [timeLeft, setTimeLeft]       = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timedOut, setTimedOut]       = useState(false);
  const [powerUps, setPowerUps] = useState<PowerUps>({
    team1: { double: true, twoAnswers: true },
    team2: { double: true, twoAnswers: true },
  });
  const [doubleActive, setDoubleActive]         = useState(false);
  const [twoAnswersActive, setTwoAnswersActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const tk        = currentTeam === 1 ? "team1" : "team2";
  const teamName  = currentTeam === 1 ? config.team1 : config.team2;
  const otherName = currentTeam === 1 ? config.team2 : config.team1;

  /* auto-end */
  const totalSlots    = config.sharedCats.length * 3 * 2;
  const usedSlotCount = Object.values(usedMap).reduce((s, v) => s + v.size, 0);
  useEffect(() => {
    if (phase === "board" && usedSlotCount > 0 && usedSlotCount >= totalSlots) {
      setTimeout(async () => {
        if (sessionId && user?.token) {
          try { await endSession(user.token, sessionId); } catch { /* best effort */ }
        }
        onEnd(scores);
      }, 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedSlotCount, totalSlots, phase]);

  /* timer */
  useEffect(() => {
    if (!timerActive) { clearInterval(timerRef.current); return; }
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Timer is informational only — at 0 we stop counting but stay on the
          // question. Team decides when to reveal (party play, flexible timing).
          setTimeout(() => { setTimerActive(false); setTimedOut(true); }, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const cellKey = (catId: string, diff: Difficulty) => `${catId}_${diff}`;

  const normalizeImageUrl = (url: string) => {
    if (!url.includes("upload.wikimedia.org/wikipedia/") || !url.includes("/thumb/")) return url;
    const parts    = url.split("/");
    const last     = parts[parts.length - 1] || "";
    const stripped = last.replace(/^\d+px-/, "");
    const fileName = stripped.replace(/\.svg\.png$/i, ".svg");
    if (!fileName) return url;
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=800`;
  };

  const pickQuestion = async (catId: string, diff: Difficulty, slot: number) => {
    const key = cellKey(catId, diff);
    const usedSlots = usedMap[key] || new Set<number>();
    if (usedSlots.has(slot)) return;

    const fetchKey = `${catId}_${diff}`;
    if (fetchedRefs.current.has(fetchKey)) {
      const pool = questionPools.current[catId]?.[diff] || [];
      const picked = pool[slot % Math.max(pool.length, 1)];
      if (!picked) return;
      openQuestion(catId, diff, slot, picked);
      return;
    }

    const cat = config.sharedCats.find(c => c.id === catId);

    if (cat?.source === "local") {
      const pool = questionPools.current[catId]?.[diff] || [];
      const picked = pool[slot % Math.max(pool.length, 1)];
      if (!picked) return;
      openQuestion(catId, diff, slot, picked);
      return;
    }

    // Remote sources (api/opentdb/islamic) need a server session. If creation
    // failed at mount, sessionId is null — surface it instead of a dead click.
    if (!sessionId || !user?.token) {
      alert("تعذّر بدء الجلسة مع الخادم. تأكد أن السيرفر يعمل وابدأ لعبة جديدة.");
      return;
    }

    if (cat?.source === "api" && cat.apiCategory && sessionId && user?.token) {
      if (fetchingCells.has(fetchKey)) return;
      setFetchingCells(prev => new Set(prev).add(fetchKey));
      try {
        const questions = await fetchQuestions(user.token, sessionId, catId, cat.apiCategory, undefined, diff);
        if (questions.length > 0) {
          const qs = questions.map((q: { q: string; a: string }) => ({ q: q.q, a: q.a, difficulty: diff }));
          questionPools.current[catId][diff] = seededShuffle(qs, gameSeed.current + catId.charCodeAt(0) * 31 + diff.length);
          fetchedRefs.current.add(fetchKey);
          const picked = questionPools.current[catId][diff][slot % Math.max(qs.length, 1)];
          if (picked) {
            openQuestion(catId, diff, slot, picked);
          }
        }
      } catch (err) {
        console.error('fetchQuestions error:', err);
      }
      setFetchingCells(prev => {
        const next = new Set(prev);
        next.delete(fetchKey);
        return next;
      });
    } else if ((cat?.source === "opentdb" || cat?.source === "islamic") && cat.apiCategoryId && sessionId && user?.token) {
      if (fetchingCells.has(fetchKey)) return;
      setFetchingCells(prev => new Set(prev).add(fetchKey));
      try {
        const questions = await fetchQuestions(user.token, sessionId, catId, undefined, cat.apiCategoryId, diff);
        if (questions.length > 0) {
          const qs = questions.map((q: { q: string; a: string }) => ({ q: q.q, a: q.a, difficulty: diff }));
          questionPools.current[catId][diff] = seededShuffle(qs, gameSeed.current + catId.charCodeAt(0) * 31 + diff.length);
          fetchedRefs.current.add(fetchKey);
          const picked = questionPools.current[catId][diff][slot % Math.max(qs.length, 1)];
          if (picked) {
            openQuestion(catId, diff, slot, picked);
          }
        }
      } catch (err) {
        console.error('fetchQuestions error:', err);
      }
      setFetchingCells(prev => {
        const next = new Set(prev);
        next.delete(fetchKey);
        return next;
      });
    }
  };

  const openQuestion = (catId: string, diff: Difficulty, slot: number, picked: Question) => {
    const key = cellKey(catId, diff);
    setUsedMap(prev => {
      const next = new Set(prev[key] || new Set<number>());
      next.add(slot);
      return { ...prev, [key]: next };
    });
    if (sessionId && user?.token) {
      markQuestionUsed(user.token, sessionId, catId, picked.q).catch(() => {});
    }
    setActive({ catId, difficulty: diff, question: picked, points: POINTS[diff], slot });
    setTimeLeft(questionTime(diff));
    setTimedOut(false);
    setDoubleActive(false);
    setTwoAnswersActive(false);
    setImageSrc(picked.imageUrl ? normalizeImageUrl(picked.imageUrl) : null);
    setPhase("question");
    setTimerActive(true);
  };

  const revealAnswer = () => { clearInterval(timerRef.current); setTimerActive(false); setPhase("reveal"); };

  // Points a team would earn for this question. Double power-up only applies
  // to the team whose turn it is (they spent it on their own pick).
  const ptsFor = (team: 1 | 2) => active ? active.points * (doubleActive && team === currentTeam ? 2 : 1) : 0;

  // winner: 1 | 2 = that team answered correctly and gets the points.
  // null = no one answered correctly. Turn alternates either way.
  const resolveQuestion = async (winner: 1 | 2 | null) => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    if (winner && active) {
      const pts = ptsFor(winner);
      const wk = winner === 1 ? "team1" : "team2";
      setScores(prev => ({ ...prev, [wk]: prev[wk] + pts }));
      if (sessionId && user?.token) {
        try {
          await updateScore(user.token, sessionId, winner, pts);
        } catch {
          // continue with local state
        }
      }
    }
    setCurrentTeam(t => (t === 1 ? 2 : 1));
    setPhase("board");
    setActive(null);
    setDoubleActive(false);
    setTwoAnswersActive(false);
  };

  const totalTime    = active ? questionTime(active.difficulty) : 60;
  const timerPct     = timeLeft / totalTime;
  const circ         = 2 * Math.PI * 28;
  const tColor       = timerPct > 0.5 ? "#22c97a" : timerPct > 0.23 ? "#f0c040" : "#e03c3c";
  const effectivePts = active ? active.points * (doubleActive ? 2 : 1) : 0;

  const isUsed = (catId: string, diff: Difficulty, slot: number) =>
    (usedMap[cellKey(catId, diff)] || new Set<number>()).has(slot);

  /* ── Desktop cell ── */
  const renderCell = (catId: string, diff: Difficulty, slot: number) => {
    const used = isUsed(catId, diff, slot);
    const fetchKey = `${catId}_${diff}`;
    // fetchingCells is added before a fetch and removed when it settles, so it
    // alone reflects the loading state (no need to read a ref during render).
    const isLoading = fetchingCells.has(fetchKey);

    return (
      <button key={`${catId}-${diff}-${slot}`} disabled={used}
        onClick={() => !used && pickQuestion(catId, diff, slot)}
        className={`bl-cell${used ? " used" : ""}`}
        style={{
          borderColor: used ? "rgba(255,255,255,0.06)" : isLoading ? "rgba(240,192,64,0.5)" : `${DIFF_COLOR[diff]}70`,
          color:       used ? "rgba(255,255,255,0.18)" : isLoading ? "var(--accent)" : DIFF_COLOR[diff],
          background:  used ? "rgba(0,0,0,0.45)" : isLoading ? "rgba(240,192,64,0.1)" : "rgba(255,255,255,0.05)",
          opacity: used ? 1 : 1,
        }}
      >
        {used ? "✓" : isLoading ? "..." : POINTS[diff]}
      </button>
    );
  };

  /* ── Mobile cell ── */
  const renderMobCell = (catId: string, diff: Difficulty, slot: number) => {
    const used = isUsed(catId, diff, slot);
    const fetchKey = `${catId}_${diff}`;
    const isLoading = fetchingCells.has(fetchKey);

    return (
      <button key={`m-${catId}-${diff}-${slot}`} disabled={used}
        onClick={() => !used && pickQuestion(catId, diff, slot)}
        className={`bl-mob-cell${used ? " used" : ""}`}
        style={{
          borderColor: used ? "rgba(255,255,255,0.06)" : isLoading ? "rgba(240,192,64,0.5)" : `${DIFF_COLOR[diff]}70`,
          color:       used ? "rgba(255,255,255,0.15)" : isLoading ? "var(--accent)" : DIFF_COLOR[diff],
          background:  used ? "rgba(0,0,0,0.45)" : isLoading ? "rgba(240,192,64,0.1)" : "rgba(255,255,255,0.05)",
          opacity: used ? 1 : 1,
        }}
      >
        {used ? "✓" : isLoading ? "..." : POINTS[diff]}
      </button>
    );
  };

  /* ── Desktop power-ups ── */
  const renderPUs = (teamKey: "team1" | "team2", isActive: boolean) => (
    <div className="bl-pu">
      {[
        { key: "double",     label: "⚡ Double",  color: "#f0c040", bg: "rgba(240,192,64,0.15)",  border: "rgba(240,192,64,0.4)"  },
        { key: "twoAnswers", label: "💡 إجابتين", color: "#22c97a", bg: "rgba(34,201,122,0.12)", border: "rgba(34,201,122,0.35)" },
      ].map(({ key, label, color, bg, border }) => {
        const avail = powerUps[teamKey][key as "double" | "twoAnswers"];
        return (
          <button key={key} className="bl-pu-btn" disabled={!isActive || !avail}
            onClick={() => {
              if (!isActive || !avail) return;
              if (key === "double")     { setPowerUps(p => ({ ...p, [teamKey]: { ...p[teamKey], double: false } }));     setDoubleActive(true); }
              if (key === "twoAnswers") { setPowerUps(p => ({ ...p, [teamKey]: { ...p[teamKey], twoAnswers: false } })); setTwoAnswersActive(true); }
            }}
            style={{ background: avail ? bg : "rgba(255,255,255,0.03)", borderColor: avail ? border : "rgba(255,255,255,0.07)", color: avail ? color : "rgba(255,255,255,0.2)" }}
          >
            {label}{avail ? "" : " ✕"}
          </button>
        );
      })}
    </div>
  );



  /* ════════════════════════════════════════
     BOARD PHASE
   ════════════════════════════════════════ */
  const handleEndGame = async () => {
    if (sessionId && user?.token) {
      try { await endSession(user.token, sessionId); } catch { /* best effort */ }
    }
    onEnd(scores);
  };

  if (phase === "board") return (
    <>
      <style>{CSS}</style>
      <div className="bl-root">

        {/* TOP BAR */}
        <div className="bl-bar">
          <button className="bl-endbtn" onClick={handleEndGame}>إنهاء اللعبة</button>
          <div className="bl-badge">⭐ دور {teamName}</div>
          <span className="bl-logo">BRAIN LEAGUE</span>
        </div>

        {/* ══ DESKTOP: teams on sides, categories center ══ */}
        <div className="bl-board-grid">
          <div className="bl-side">
            {([1] as (1 | 2)[]).map(t => {
              const isOn    = currentTeam === t;
              const teamKey = t === 1 ? "team1" : "team2";
              const name    = t === 1 ? config.team1 : config.team2;
              const score   = t === 1 ? scores.team1  : scores.team2;
              return (
                <div key={t} className={`bl-team${isOn ? " on" : ""}`}>
                  <div className="bl-t-label">الفريق {t}</div>
                  <div className="bl-t-name">{name}</div>
                  <div className="bl-t-score">{score}</div>
                  {isOn && <div className="bl-dot" />}
                  {renderPUs(teamKey, isOn)}
                </div>
              );
            })}
          </div>

          <div className="bl-cats-desk">
            {config.sharedCats.map(cat => {
              const fullCat = getCategoryData(cat);
              if (!fullCat) return null;
              return (
                <div className="bl-card-desk" key={cat.id}>
                  <div className="bl-pt-row">
                    {renderCell(cat.id, "easy", 0)}
                    {renderCell(cat.id, "easy", 1)}
                  </div>
                  <div className="bl-cat-img">
                    {fullCat.imageUrl ? (
                      <img src={fullCat.imageUrl} alt={fullCat.name}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.opacity = "1";
                        }}
                      />
                    ) : null}
                    <div style={{ position:"absolute", inset:0, background: fullCat.grad, opacity: fullCat.imageUrl ? 0 : 1, transition:"opacity .3s" }} />
                    <div className="bl-cat-ov" />
                    <div className="bl-cat-label">
                      <span className="bl-cat-emoji-d">{fullCat.emoji}</span>
                      <div className="bl-cat-name-d">{fullCat.name}</div>
                    </div>
                  </div>
                  <div className="bl-pt-row">
                    {renderCell(cat.id, "medium", 0)}
                    {renderCell(cat.id, "medium", 1)}
                  </div>
                  <div className="bl-pt-row">
                    {renderCell(cat.id, "hard", 0)}
                    {renderCell(cat.id, "hard", 1)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bl-side">
            {([2] as (1 | 2)[]).map(t => {
              const isOn    = currentTeam === t;
              const teamKey = t === 1 ? "team1" : "team2";
              const name    = t === 1 ? config.team1 : config.team2;
              const score   = t === 1 ? scores.team1  : scores.team2;
              return (
                <div key={t} className={`bl-team${isOn ? " on" : ""}`}>
                  <div className="bl-t-label">الفريق {t}</div>
                  <div className="bl-t-name">{name}</div>
                  <div className="bl-t-score">{score}</div>
                  {isOn && <div className="bl-dot" />}
                  {renderPUs(teamKey, isOn)}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ MOBILE: rkz-style — big cards with side buttons ══ */}
        <div className="bl-mob-cats">
          {config.sharedCats.map(cat => {
            const fullCat = getCategoryData(cat);
            if (!fullCat) return null;
            return (
              <div className="bl-mob-card" key={cat.id}>
                {/* Left column: easy(0) + medium(0) + hard(0) */}
                <div className="bl-mob-col">
                  {diffs.map(d => renderMobCell(cat.id, d, 0))}
                </div>

                {/* Centre: image + name */}
                <div className="bl-mob-img">
                  {fullCat.imageUrl ? (
                    <img src={fullCat.imageUrl} alt={fullCat.name}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
                        if (fb) fb.style.opacity = "1";
                      }}
                    />
                  ) : null}
                  <div style={{ position:"absolute", inset:0, background: fullCat.grad, opacity: fullCat.imageUrl ? 0 : 1 }} />
                  <div className="bl-mob-ov" />
                  <div className="bl-mob-label">
                    <span className="bl-mob-emoji">{fullCat.emoji}</span>
                    <div className="bl-mob-name">{fullCat.name}</div>
                  </div>
                </div>

                {/* Right column: easy(1) + medium(1) + hard(1) */}
                <div className="bl-mob-col">
                  {diffs.map(d => renderMobCell(cat.id, d, 1))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ MOBILE: scores sticky bottom bar ══ */}
        <div className="bl-mob-scores">
          {([1, 2] as const).map((t, i) => {
            const isOn    = currentTeam === t;
            const teamKey = t === 1 ? "team1" : "team2";
            const name    = t === 1 ? config.team1  : config.team2;
            const score   = t === 1 ? scores.team1   : scores.team2;
            return (
              <>
                {i === 1 && <div key="div" className="bl-mob-divider" />}
                <div key={t} className={`bl-mob-team${isOn ? " on" : ""}`}>
                  <div className="bl-mob-t-label">الفريق {t}</div>
                  <div className="bl-mob-t-name">{name}</div>
                  <div className="bl-mob-t-score">{score}</div>
                  {isOn && <div className="bl-mob-t-dot" />}
                  {/* mini power-up buttons */}
                  <div className="bl-mob-pus">
                    {[
                      { key: "double",     label: "⚡",  color: "#f0c040", bg: "rgba(240,192,64,0.18)",  border: "rgba(240,192,64,0.45)"  },
                      { key: "twoAnswers", label: "💡",  color: "#22c97a", bg: "rgba(34,201,122,0.15)", border: "rgba(34,201,122,0.4)"  },
                    ].map(({ key, label, color, bg, border }) => {
                      const avail = powerUps[teamKey][key as "double" | "twoAnswers"];
                      return (
                        <button key={key} className="bl-mob-pu-btn" disabled={!isOn || !avail}
                          onClick={() => {
                            if (!isOn || !avail) return;
                            if (key === "double")     { setPowerUps(p => ({ ...p, [teamKey]: { ...p[teamKey], double: false } }));     setDoubleActive(true); }
                            if (key === "twoAnswers") { setPowerUps(p => ({ ...p, [teamKey]: { ...p[teamKey], twoAnswers: false } })); setTwoAnswersActive(true); }
                          }}
                          style={{ background: avail ? bg : "rgba(255,255,255,0.04)", borderColor: avail ? border : "rgba(255,255,255,0.08)", color: avail ? color : "rgba(255,255,255,0.2)" }}
                        >
                          {label}{avail ? "" : "✕"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })}
        </div>

      </div>
    </>
  );

  /* ════════════════════════════════════════
     QUESTION PHASE
  ════════════════════════════════════════ */
  if (phase === "question" && active) {
    const selCat = config.sharedCats.find(c => c.id === active.catId);
    const cat = selCat ? getCategoryData(selCat) : null;
    if (!cat) return null;
    return (
      <>
        <style>{CSS}</style>
        <div className="bl-q-wrap">
          <div className="bl-q-inner">
            {/* Power-ups */}
            <div className="bl-q-purow">
              {[
                { key: "double",     label: "⚡ Double Points", color: "#f0c040", bg: "rgba(240,192,64,0.15)",  border: "rgba(240,192,64,0.4)"  },
                { key: "twoAnswers", label: "💡 إجابتين",       color: "#22c97a", bg: "rgba(34,201,122,0.12)", border: "rgba(34,201,122,0.35)" },
              ].map(({ key, label, color, bg, border }) => {
                const avail     = powerUps[tk][key as "double" | "twoAnswers"];
                const activeNow = key === "double" ? doubleActive : twoAnswersActive;
                return (
                  <button key={key} className="bl-q-pu" disabled={!avail && !activeNow}
                    onClick={() => {
                      if (key === "double"     && avail) { setPowerUps(p => ({ ...p, [tk]: { ...p[tk], double: false } }));     setDoubleActive(true); }
                      if (key === "twoAnswers" && avail) { setPowerUps(p => ({ ...p, [tk]: { ...p[tk], twoAnswers: false } })); setTwoAnswersActive(true); }
                    }}
                    style={{
                      background:  activeNow ? bg  : avail ? bg  : "rgba(255,255,255,0.04)",
                      borderColor: activeNow ? border : avail ? border : "rgba(255,255,255,0.08)",
                      color:       activeNow ? color : avail ? color : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {label}{activeNow ? " ✓" : avail ? "" : " (مستُخدمة)"}
                  </button>
                );
              })}
            </div>

            {/* Tags */}
            <div className="bl-tagrow">
              <div className="bl-tag" style={{ background: cat.grad }}>{cat.emoji} {cat.name}</div>
              <div className="bl-tag" style={{
                background:  doubleActive ? "rgba(240,192,64,0.2)" : `${DIFF_COLOR[active.difficulty]}15`,
                color:       doubleActive ? "#f0c040" : DIFF_COLOR[active.difficulty],
                border:      `1.5px solid ${doubleActive ? "#f0c04060" : DIFF_COLOR[active.difficulty] + "50"}`,
              }}>
                {doubleActive ? "⚡ " : ""}{DIFF_LABEL[active.difficulty]} — {effectivePts} نقطة
              </div>
            </div>

            {/* Timer */}
            <div className="bl-timer-c">
              <div style={{ position:"relative", width:80, height:80 }}>
                <svg viewBox="0 0 80 80" style={{ width:80, height:80, transform:"rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="28" fill="none" stroke={tColor} strokeWidth="6"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - timerPct)} strokeLinecap="round"
                    style={{ transition:"stroke-dashoffset 1s linear, stroke 0.3s" }} />
                </svg>
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, fontWeight:900, color:tColor, fontFamily:"'Bebas Neue',sans-serif",
                  animation: timeLeft <= 5 ? "timerPop 1s ease-in-out infinite" : "none",
                }}>{timeLeft}</div>
              </div>
            </div>

            <div style={{ fontSize:11, color:"var(--muted)", textAlign:"center", marginBottom:10 }}>{teamName} — أجب عن السؤال</div>

            {imageSrc && (
              <div className="bl-q-img">
                <img src={imageSrc} alt="سؤال" onError={() => setImageSrc(null)} />
              </div>
            )}

            <div className="bl-q-text">{active.question.q}</div>
            <button className="bl-rev-btn" onClick={revealAnswer}>👁️ إظهار الإجابة</button>
          </div>
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════
     REVEAL PHASE
  ════════════════════════════════════════ */
  if (phase === "reveal" && active) {
    const selCat = config.sharedCats.find(c => c.id === active.catId);
    const cat = selCat ? getCategoryData(selCat) : null;
    if (!cat) return null;
    return (
      <>
        <style>{CSS}</style>
        <div className="bl-rv-wrap">
          <div className="bl-rv-inner">
            <div className="bl-tagrow">
              <div className="bl-tag" style={{ background: cat.grad }}>{cat.emoji} {cat.name}</div>
              <div className="bl-tag" style={{
                color:      DIFF_COLOR[active.difficulty],
                background: `${DIFF_COLOR[active.difficulty]}15`,
                border:     `1px solid ${DIFF_COLOR[active.difficulty]}40`,
              }}>{DIFF_LABEL[active.difficulty]}</div>
            </div>

            <div style={{
              background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px",
              fontSize:15, color:"var(--muted)", textAlign:"center", marginBottom:14, lineHeight:1.5, direction:"rtl",
            }}>{active.question.q}</div>

            <div style={{ fontSize:11, color:"var(--accent)", textAlign:"center", marginBottom:8, letterSpacing:1 }}>الإجابة الصح:</div>

            <div className="bl-ans-box" style={{
              background: "rgba(34,201,122,0.12)",
              border:     "1.5px solid #22c97a",
              color:      "#22c97a",
            }}>{active.question.a}</div>

            {timedOut && <div style={{ textAlign:"center", color:"#e03c3c", fontSize:13, marginBottom:8 }}>⏰ انتهى الوقت!</div>}

            <div style={{ fontSize:13, color:"#f0f4ff", textAlign:"center", marginBottom:12, fontWeight:700 }}>
              مين جاوب صح؟
            </div>

            {/* Either team can win the points — tap whoever answered correctly */}
            <div className="bl-vrow">
              {([1, 2] as const).map(t => {
                const name    = t === 1 ? config.team1 : config.team2;
                const isTurn  = t === currentTeam;
                const pts     = ptsFor(t);
                return (
                  <button key={t} className="bl-vbtn" onClick={() => resolveQuestion(t)}
                    style={{
                      background: t === 1 ? "linear-gradient(135deg,#1a5c8a,#0d3a5c)" : "linear-gradient(135deg,#8a5c1a,#5c3a0d)",
                      border: isTurn ? "2px solid rgba(240,192,64,0.7)" : "2px solid transparent",
                      display:"flex", flexDirection:"column", gap:2, alignItems:"center",
                    }}>
                    <span style={{ fontSize:15 }}>{name}{isTurn ? " ⭐" : ""}</span>
                    <span style={{ fontSize:13, opacity:.9, fontWeight:700 }}>+{pts}{doubleActive && isTurn ? " ⚡" : ""}</span>
                  </button>
                );
              })}
            </div>

            <button className="bl-nxtbtn" onClick={() => resolveQuestion(null)}
              style={{ background:"linear-gradient(135deg,#3a2a2a,#241818)" }}>
              🚫 لا أحد جاوب
            </button>

            <div style={{ textAlign:"center", fontSize:11, color:"rgba(240,244,255,0.3)" }}>← دور {otherName} بعدين</div>
          </div>
        </div>
      </>
    );
  }

  return null;
}