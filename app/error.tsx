"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-page__card">
        <span className="error-page__mark" aria-hidden>
          WS
        </span>
        <h1>Something went wrong</h1>
        <p className="error-page__message">{error.message || "An unexpected error occurred."}</p>
        <div className="error-page__actions">
          <button type="button" className="btn btn--primary" onClick={() => reset()}>
            Try again
          </button>
          <a href="/" className="btn btn--secondary">
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
