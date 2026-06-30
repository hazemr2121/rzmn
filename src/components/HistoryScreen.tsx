import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getHistory, deleteSession } from "../services/gameApi";

type HistoryItem = {
  _id: string;
  team1: string;
  team2: string;
  categories: { id: string; source: string; name: string }[];
  scores: { team1: number; team2: number };
  status: string;
  updatedAt: string;
};

export default function HistoryScreen({ onBack, onResume }: { onBack: () => void; onResume: (session: HistoryItem) => void }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.token) { setLoading(false); return; }
      try {
        const data = await getHistory(user.token);
        setHistory(data || []);
      } catch {
        // empty
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user?.token) return;
    setDeleting(id);
    try {
      await deleteSession(user.token, id);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch {
      // ignore
    }
    setDeleting(null);
  };

  const handleDeleteAll = async () => {
    if (!user?.token || history.length === 0) return;
    setDeleting("all");
    try {
      await Promise.all(history.map(h => deleteSession(user.token, h._id)));
      setHistory([]);
    } catch {
      // ignore
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      <div style={{ padding: "20px 20px 12px", position: "sticky", top: 0, zIndex: 10, background: "rgba(8,12,20,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>→ رجوع</button>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "var(--accent)", letterSpacing: 3 }}>BRAIN LEAGUE</span>
          {history.length > 0 && (
            <button onClick={handleDeleteAll} disabled={deleting === "all"} style={{ background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: 8, padding: "6px 12px", color: "#e03c3c", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {deleting === "all" ? "..." : "حذف الكل"}
            </button>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, textAlign: "center", marginTop: 8 }}>سجل الألعاب</div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ fontSize: 16, color: "var(--accent)" }}>جاري التحميل...</div>
        </div>
      ) : history.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}></div>
          <div style={{ fontSize: 18, color: "var(--muted)" }}>مفيش ألعاب سابقة</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>العب أول لعبة وهتظهر هنا</div>
        </div>
      ) : (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map((game) => {
            const t1Wins = game.scores.team1 > game.scores.team2;
            const draw = game.scores.team1 === game.scores.team2;
            const winner = draw ? "تعادل" : t1Wins ? game.team1 : game.team2;
            return (
              <div key={game._id} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "16px",
                opacity: deleting === game._id ? 0.5 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#e8f0ff" }}>
                      {game.team1} <span style={{ color: "var(--muted)" }}>vs</span> {game.team2}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{formatDate(game.updatedAt)}</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Bebas Neue',sans-serif", color: "var(--accent)" }}>
                      {game.scores.team1} - {game.scores.team2}
                    </div>
                    <div style={{ fontSize: 10, color: draw ? "var(--muted)" : "#22c97a", textAlign: "center" }}>
                      {game.status === "active" ? "جارية" : draw ? "تعادل" : `${winner} فاز`}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                  {game.categories.map((c, i) => (
                    <span key={i} style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: c.source === "api" ? "rgba(34,201,122,0.1)" : "rgba(240,192,64,0.1)",
                      color: c.source === "api" ? "#22c97a" : "var(--accent)",
                      border: `1px solid ${c.source === "api" ? "rgba(34,201,122,0.2)" : "rgba(240,192,64,0.2)"}`,
                    }}>
                      {c.source === "api" ? "EN" : "عربي"} {c.name}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {game.status === "active" && (
                    <button
                      onClick={() => onResume(game)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "linear-gradient(135deg,#22c97a,#0d5c34)",
                        border: "none",
                        borderRadius: 10,
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      كمّل اللعبة ▶
                    </button>
                  )}
                  <button
                    onClick={() => onResume(game)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "linear-gradient(135deg,#f0c040,#e07b20)",
                      border: "none",
                      borderRadius: 10,
                      color: "#080c14",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ابدأ من جديد
                  </button>
                  <button
                    onClick={() => handleDelete(game._id)}
                    disabled={deleting === game._id}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(224,60,60,0.1)",
                      border: "1px solid rgba(224,60,60,0.2)",
                      borderRadius: 10,
                      color: "#e03c3c",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {deleting === game._id ? "..." : ""}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
