"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#111827",
        color: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "1.5rem",
        textAlign: "center",
        margin: 0,
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1.25rem" }}>📵</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        Você está offline
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#9CA3AF", lineHeight: 1.6, maxWidth: "20rem", margin: 0 }}>
        Verifique sua conexão com a internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          background: "#7C3AED",
          color: "#fff",
          border: "none",
          borderRadius: "9999px",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
