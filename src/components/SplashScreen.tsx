export default function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #1a1200 0%, #080c14 70%)",
        padding: 32,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 200 + i * 120,
            height: 200 + i * 120,
            borderRadius: "50%",
            border: "1px solid rgba(240,192,64,0.08)",
            animation: `pulse ${3 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 76,
          letterSpacing: 6,
          lineHeight: 1,
          background: "linear-gradient(135deg,#f0c040 0%,#e07b20 50%,#f0c040 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shine 3s linear infinite, fadeUp 0.6s ease both",
        }}
      >
        BRAIN
        <br />
        LEAGUE
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(240,192,64,0.55)",
          letterSpacing: 5,
          marginTop: 8,
          marginBottom: 40,
          fontFamily: "'Bebas Neue',sans-serif",
          animation: "fadeUp 0.6s 0.2s ease both",
          opacity: 0,
        }}
      >
        THE ULTIMATE QUIZ BATTLE
      </div>
      <div style={{ fontSize: 36, marginBottom: 32, animation: "fadeUp 0.6s 0.3s ease both", opacity: 0 }}>
        🧠 ⚡ 🏆
      </div>
      <button
        onClick={onContinue}
        style={{
          background: "linear-gradient(135deg,#f0c040,#e07b20)",
          border: "none",
          borderRadius: 18,
          padding: "16px 52px",
          color: "#080c14",
          fontWeight: 900,
          fontSize: 19,
          boxShadow: "0 8px 40px rgba(240,192,64,0.45)",
          animation: "fadeUp 0.6s 0.4s ease both, pulse 2s 1s ease-in-out infinite",
          opacity: 0,
        }}
      >
        ابدأ اللعبة 🔥
      </button>
    </div>
  );
}
