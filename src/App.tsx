import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { Screen, GameConfig, Scores, SelectedCategory } from "./types";
import { globalStyles } from "./styles/globalStyles";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import SplashScreen from "./components/SplashScreen";
import SetupScreen from "./components/SetupScreen";
import CategoryPicker from "./components/CategoryPicker";
import BoardScreen from "./components/BoardScreen";
import EndScreen from "./components/EndScreen";
import HistoryScreen from "./components/HistoryScreen";
import ErrorBoundary from "./components/ErrorBoundary";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");
  const [screen, setScreen] = useState<Screen>("splash");
  const [config, setConfig] = useState<GameConfig>({ team1: "", team2: "", sharedCats: [] });
  const [finalScores, setFinalScores] = useState<Scores>({ team1: 0, team2: 0 });

  if (loading) {
    return <style>{globalStyles}</style>;
  }

  if (!user) {
    return (
      <>
        <style>{globalStyles}</style>
        {authScreen === "login" ? (
          <LoginScreen onSwitch={() => setAuthScreen("signup")} onLogin={() => setScreen("splash")} />
        ) : (
          <SignupScreen onSwitch={() => setAuthScreen("login")} onSignup={() => setScreen("splash")} />
        )}
      </>
    );
  }

  const handleResume = (session: {
    team1: string;
    team2: string;
    categories: { id: string; source: string; name: string; apiCategory?: string; apiCategoryId?: number }[];
  }) => {
    setConfig({
      team1: session.team1,
      team2: session.team2,
      sharedCats: session.categories.map((c) => ({
        id: c.id,
        source: c.source as SelectedCategory["source"],
        name: c.name,
        apiCategory: c.apiCategory,
        apiCategoryId: c.apiCategoryId,
      })),
    });
    setScreen("board");
  };

  return (
    <>
      <style>{globalStyles}</style>
      {screen === "splash" && (
        <div style={{ position: "relative" }}>
          <SplashScreen onContinue={() => setScreen("setup")} />
          <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, zIndex: 50 }}>
            <button
              onClick={() => setScreen("history")}
              style={{
                background: "rgba(240,192,64,0.1)",
                border: "1px solid rgba(240,192,64,0.25)",
                borderRadius: 10,
                padding: "8px 14px",
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              السجل
            </button>
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "8px 14px",
                color: "var(--muted)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              خروج
            </button>
          </div>
        </div>
      )}
      {screen === "history" && (
        <HistoryScreen
          onBack={() => setScreen("splash")}
          onResume={handleResume}
        />
      )}
      {screen === "setup" && <SetupScreen onDone={(cfg) => { setConfig(cfg); setScreen("pick"); }} />}
      {screen === "pick" && (
        <CategoryPicker
          config={config}
          onDone={(cats) => {
            setConfig({ ...config, sharedCats: cats });
            setScreen("board");
          }}
        />
      )}
      {screen === "board" && (
        <BoardScreen
          config={config}
          onEnd={(s) => {
            setFinalScores(s);
            setScreen("end");
          }}
        />
      )}
      {screen === "end" && (
        <EndScreen
          scores={finalScores}
          config={config}
          onRestart={() => {
            setConfig({ team1: "", team2: "", sharedCats: [] });
            setScreen("splash");
          }}
          onHistory={() => setScreen("history")}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
