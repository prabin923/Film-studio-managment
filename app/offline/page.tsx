export const metadata = {
  title: "Offline · WedStudio OS",
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", margin: 0 }}>You&apos;re offline</h1>
      <p style={{ maxWidth: "28rem", opacity: 0.7, margin: 0 }}>
        WedStudio OS needs a connection to load your studio data. Check your network and try again.
      </p>
    </main>
  );
}
