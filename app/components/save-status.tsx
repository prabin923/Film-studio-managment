"use client";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveStatusBar({
  state,
  error,
  onRetry,
}: {
  state: SaveState;
  error?: string;
  onRetry?: () => void;
}) {
  if (state === "idle") return null;

  return (
    <div
      className={`save-status save-status--${state}`}
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {state === "saving" ? <span>Saving changes…</span> : null}
      {state === "saved" ? <span>All changes saved</span> : null}
      {state === "error" ? (
        <>
          <span>{error || "Could not save. Check your connection."}</span>
          {onRetry ? (
            <button className="save-status__retry" type="button" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
