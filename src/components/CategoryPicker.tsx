import { useState } from "react";
import type { GameConfig, SelectedCategory } from "../types";
import { CATEGORIES } from "../data/categories";
import { API_CATEGORIES } from "../data/apiCategories";
import { OPENTDB_CATEGORIES } from "../data/opentdbCategories";
import { ISLAMIC_CATEGORIES } from "../data/islamicCategories";

type Tab = "arabic" | "api" | "opentdb" | "islamic";

export default function CategoryPicker({ config, onDone }: { config: GameConfig; onDone: (cats: SelectedCategory[]) => void }) {
  const [tab, setTab] = useState<Tab>("arabic");
  const [selected, setSelected] = useState<SelectedCategory[]>([]);

  const allCats =
    tab === "arabic" ? CATEGORIES :
    tab === "api" ? API_CATEGORIES :
    tab === "opentdb" ? OPENTDB_CATEGORIES :
    ISLAMIC_CATEGORIES;

  const toggle = (cat: (typeof CATEGORIES)[0]) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c.id === cat.id);
      if (exists) return prev.filter((c) => c.id !== cat.id);
      if (prev.length >= 6) return prev;
      return [...prev, {
        id: cat.id,
        source: cat.source,
        name: cat.name,
        apiCategory: cat.apiCategory,
        apiCategoryId: cat.apiCategoryId,
      }];
    });
  };

  const isSelected = (id: string) => selected.some((c) => c.id === id);
  const isDisabled = (id: string) => !isSelected(id) && selected.length === 6;
  const done = selected.length === 6;

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1,
    padding: "10px 8px",
    border: "none",
    borderRadius: t === tab ? 12 : 0,
    background: t === tab ? "linear-gradient(135deg,#f0c040,#e07b20)" : "transparent",
    color: t === tab ? "#080c14" : "var(--muted)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100, background: "var(--bg)" }}>
      <div
        style={{
          padding: "16px 20px 0",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(8,12,20,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "var(--accent)", letterSpacing: 3, marginBottom: 4 }}>
            BRAIN LEAGUE
          </div>
          <div style={{ fontSize: 19, fontWeight: 900 }}>اختار الـ Categories</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {config.team1} و {config.team2} — اختاروا 6 ({selected.length}/6)
          </div>
        </div>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
          <button style={tabStyle("arabic")} onClick={() => setTab("arabic")}>🇪 عربي</button>
          <button style={tabStyle("api")} onClick={() => setTab("api")}>🌍 Trivia API</button>
          <button style={tabStyle("opentdb")} onClick={() => setTab("opentdb")}>🎯 OpenTDB</button>
          <button style={tabStyle("islamic")} onClick={() => setTab("islamic")}>🕌 إسلامي</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4 }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                transition: "background 0.3s",
                background: i < selected.length ? "var(--accent)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px" }}>
        {allCats.map((cat) => {
          const sel = isSelected(cat.id);
          const disabled = isDisabled(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => !disabled && toggle(cat)}
              style={{
                background: sel ? cat.grad : "rgba(255,255,255,0.04)",
                border: `2px solid ${sel ? "var(--accent)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 18,
                overflow: "hidden",
                textAlign: "center",
                position: "relative",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.35 : 1,
                transform: sel ? "scale(0.97)" : "scale(1)",
                transition: "all 0.2s",
                userSelect: "none",
                boxShadow: sel ? "0 4px 20px rgba(240,192,64,0.2)" : "none",
              }}
            >
              <div
                style={{
                  height: 110,
                  backgroundImage: cat.imageUrl ? `url(${cat.imageUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: sel ? "none" : "saturate(0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: sel
                    ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(8,12,20,0.85) 70%)"
                    : "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(8,12,20,0.9) 70%)",
                }}
              />
              <div style={{ position: "relative", padding: "14px 12px 16px" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>{cat.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e8f0ff", display: "block" }}>{cat.name}</span>
              </div>
              {sel && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "var(--accent)",
                    color: "#080c14",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {selected.findIndex((c) => c.id === cat.id) + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px",
            background: "rgba(8,12,20,0.97)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => onDone(selected)}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg,#f0c040,#e07b20)",
              border: "none",
              borderRadius: 16,
              color: "#080c14",
              fontWeight: 900,
              fontSize: 18,
              boxShadow: "0 6px 24px rgba(240,192,64,0.4)",
            }}
          >
            ابدأ اللعب 🚀
          </button>
        </div>
      )}
    </div>
  );
}
