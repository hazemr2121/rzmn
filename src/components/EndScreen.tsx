import type { GameConfig, Scores } from "../types";

export default function EndScreen({ scores, config, onRestart, onHistory }: { scores: Scores; config: GameConfig; onRestart: () => void; onHistory?: () => void }) {
  const t1Wins = scores.team1 > scores.team2;
  const draw = scores.team1 === scores.team2;
  const winner = draw ? "🤝 تعادل!" : `🏆 ${t1Wins ? config.team1 : config.team2} فاز!`;
  const total = scores.team1 + scores.team2;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 20%, #1a1200, #080c14)",
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }}>🏆</div>
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 36,
          letterSpacing: 2,
          marginBottom: 32,
          background: "linear-gradient(135deg,#f0c040,#e07b20)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {winner}
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "24px 32px",
          width: "100%",
          maxWidth: 360,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 16 }}>
          {[1, 2].map((t) => {
            const nm = t === 1 ? config.team1 : config.team2;
            const sc = t === 1 ? scores.team1 : scores.team2;
            const wins = !draw && ((t === 1 && t1Wins) || (t === 2 && !t1Wins));
            return (
              <div key={t} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{nm}</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: wins ? "var(--accent)" : "#fff" }}>{sc}</div>
                {wins && <div style={{ fontSize: 12, color: "var(--accent)" }}>الفائز ⭐</div>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, borderRadius: 99, overflow: "hidden", height: 6, background: "rgba(255,255,255,0.1)" }}>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              transition: "width 0.7s",
              width: `${total > 0 ? (scores.team1 / total) * 100 : 50}%`,
              background: "linear-gradient(90deg,#f0c040,#e07b20)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4, color: "rgba(255,255,255,0.3)" }}>
          <span>{config.team1}</span>
          <span>{config.team2}</span>
        </div>
      </div>
      <button
        onClick={onRestart}
        style={{
          padding: "16px 48px",
          background: "linear-gradient(135deg,#f0c040,#e07b20)",
          border: "none",
          borderRadius: 16,
          color: "#080c14",
          fontWeight: 900,
          fontSize: 18,
          boxShadow: "0 8px 32px rgba(240,192,64,0.35)",
          marginBottom: 12,
        }}
      >
        🔄 لعبة جديدة
      </button>
      {onHistory && (
        <button
          onClick={onHistory}
          style={{
            padding: "12px 32px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          السجل
        </button>
      )}
    </div>
  );
}
