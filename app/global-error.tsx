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
          background: "#f5f4f1",
          color: "#171717",
        }}
      >
        <div style={{ maxWidth: 400, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>WedStudio OS</h1>
          <p style={{ color: "#525252", marginBottom: 20 }}>
            {error.message || "A critical error occurred."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#171717",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
