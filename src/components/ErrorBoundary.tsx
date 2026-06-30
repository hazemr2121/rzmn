import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

// Catches render-time crashes so testers see a recoverable screen instead of a
// blank white page. All copy is Arabic / RTL to match the rest of the app.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: 24,
          background: "var(--bg, #080c14)",
          color: "#e8f0ff",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 44 }}>😵‍💫</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>صار خطأ غير متوقع</div>
        <div style={{ fontSize: 14, color: "var(--muted, #8a96a8)", maxWidth: 360, lineHeight: 1.6 }}>
          حصلت مشكلة بالواجهة. جرّب تحديث الصفحة لإكمال اللعب.
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 6,
            padding: "12px 28px",
            borderRadius: 12,
            border: "1px solid rgba(240,192,64,0.4)",
            background: "rgba(240,192,64,0.15)",
            color: "var(--accent, #f0c040)",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          تحديث الصفحة
        </button>
      </div>
    );
  }
}
