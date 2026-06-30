import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import type { ActiveSession, GameConfig, SelectedCategory } from "../types";
import { useAuth } from "../context/AuthContext";
import { getActiveSession, resumeSession, deleteSession } from "../services/gameApi";

export default function SetupScreen({ onDone }: { onDone: (cfg: GameConfig) => void }) {
  const { user } = useAuth();
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const ready = team1.trim() && team2.trim();

  useEffect(() => {
    const checkSession = async () => {
      if (!user?.token) { setLoading(false); return; }
      try {
        const session = await getActiveSession(user.token);
        setActiveSession(session);
      } catch {
        // no active session
      }
      setLoading(false);
    };
    checkSession();
  }, [user]);

  const inp: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(240,192,64,0.25)",
    borderRadius: 14,
    color: "#f0f4ff",
    fontSize: 17,
    padding: "14px 16px",
    outline: "none",
    direction: "rtl",
    marginBottom: 8,
  };

  const handleNewGame = () => {
    onDone({ team1: team1.trim(), team2: team2.trim(), sharedCats: [] });
  };

  const handleResume = async () => {
    if (!user?.token || !activeSession) return;
    try {
      const session = await resumeSession(user.token, activeSession._id);
      onDone({
        team1: session.team1,
        team2: session.team2,
        sharedCats: session.categories as SelectedCategory[],
      });
    } catch {
      // fallback to new game
      handleNewGame();
    }
  };

  const handleDeleteSession = async () => {
    if (!user?.token || !activeSession) return;
    try {
      await deleteSession(user.token, activeSession._id);
      setActiveSession(null);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ fontSize: 18, color: "var(--accent)", fontWeight: 700 }}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      <div style={{ padding: "32px 20px 16px", textAlign: "center" }}>
        <span
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 40,
            letterSpacing: 3,
            background: "linear-gradient(135deg,#f0c040,#e07b20)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          BRAIN LEAGUE
        </span>
      </div>
      <div style={{ padding: "0 20px" }}>
        {activeSession && (
          <div
            style={{
              background: "rgba(34,201,122,0.06)",
              border: "1px solid rgba(34,201,122,0.2)",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "#22c97a", marginBottom: 8 }}>
              🎮 في لعبة سابقة!
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
              {activeSession.team1} vs {activeSession.team2} — {activeSession.scores.team1} / {activeSession.scores.team2}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleResume}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg,#22c97a,#0d5c34)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                كمّل اللعبة ▶
              </button>
              <button
                onClick={handleDeleteSession}
                style={{
                  padding: "12px 16px",
                  background: "rgba(224,60,60,0.15)",
                  border: "1px solid rgba(224,60,60,0.3)",
                  borderRadius: 12,
                  color: "#e03c3c",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "24px 20px",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "var(--accent)" }}>🏆 أسماء الفرق</h2>
          {[
            { label: "اسم الفريق الأول", val: team1, set: setTeam1, ph: "مثلاً: النسور 🦅" },
            { label: "اسم الفريق الثاني", val: team2, set: setTeam2, ph: "مثلاً: الأسود " },
          ].map(({ label, val, set, ph }, i) => (
            <div key={i}>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{label}</label>
              <input style={inp} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
            </div>
          ))}
          <button
            disabled={!ready}
            onClick={handleNewGame}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "15px",
              background: ready ? "linear-gradient(135deg,#f0c040,#e07b20)" : "#222",
              border: "none",
              borderRadius: 14,
              color: ready ? "#080c14" : "#444",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: ready ? "0 6px 24px rgba(240,192,64,0.3)" : "none",
              transition: "all 0.3s",
            }}
          >
            لعبة جديدة ←
          </button>
        </div>
        <div
          style={{
            background: "rgba(240,192,64,0.06)",
            border: "1px solid rgba(240,192,64,0.15)",
            borderRadius: 14,
            padding: "12px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(240,192,64,0.7)" }}> الفريقين هيختاروا 6 categories مشتركة</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            سهل 300 نقطة | متوسط 600 | صعب 900 — كل category فيها 6 أسئلة (2 لكل مستوى)
          </div>
        </div>
      </div>
    </div>
  );
}
