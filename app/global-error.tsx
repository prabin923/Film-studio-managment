"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#fafaf9",
          color: "#0f172a",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 400,
            padding: 32,
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>WedStudio OS</h1>
          <p style={{ color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
            {error.message || "A critical error occurred."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
