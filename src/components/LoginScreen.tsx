import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ onSwitch, onLogin }: { onSwitch: () => void; onLogin: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, #1a1200 0%, #080c14 70%)",
      padding: 32,
    }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 200 + i * 120,
          height: 200 + i * 120,
          borderRadius: "50%",
          border: "1px solid rgba(240,192,64,0.08)",
          animation: `pulse ${3 + i * 1.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}

      <div style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 40,
        letterSpacing: 3,
        background: "linear-gradient(135deg,#f0c040,#e07b20)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 8,
        animation: "fadeUp 0.6s ease both",
      }}>
        BRAIN LEAGUE
      </div>
      <div style={{
        fontSize: 13,
        color: "rgba(240,192,64,0.55)",
        letterSpacing: 5,
        fontFamily: "'Bebas Neue',sans-serif",
        marginBottom: 32,
        animation: "fadeUp 0.6s 0.1s ease both",
        opacity: 0,
      }}>
        THE ULTIMATE QUIZ BATTLE
      </div>

      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "28px 24px",
        animation: "fadeUp 0.6s 0.2s ease both",
        opacity: 0,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 24, color: "var(--accent)" }}>
          تسجيل الدخول
        </h2>

        {error && (
          <div style={{
            background: "rgba(224,60,60,0.12)",
            border: "1px solid rgba(224,60,60,0.3)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            color: "#e03c3c",
            textAlign: "center",
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              dir="ltr"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(240,192,64,0.25)",
                borderRadius: 14,
                color: "#f0f4ff",
                fontSize: 16,
                padding: "13px 16px",
                outline: "none",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(240,192,64,0.25)",
                borderRadius: 14,
                color: "#f0f4ff",
                fontSize: 16,
                padding: "13px 16px",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#222" : "linear-gradient(135deg,#f0c040,#e07b20)",
              border: "none",
              borderRadius: 14,
              color: loading ? "#444" : "#080c14",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: loading ? "none" : "0 6px 24px rgba(240,192,64,0.3)",
              transition: "all 0.3s",
            }}
          >
            {loading ? "جاري الدخول..." : "دخول 🚀"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          عندكش حساب؟{" "}
          <span
            onClick={onSwitch}
            style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}
          >
            سجل دلوقتي
          </span>
        </div>
      </div>
    </div>
  );
}
