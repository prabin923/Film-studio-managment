import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <div className="error-page__card">
        <span className="error-page__mark" aria-hidden>
          WS
        </span>
        <h1>Page not found</h1>
        <p className="error-page__message">This page does not exist in WedStudio OS.</p>
        <p className="error-page__hint">
          Try the <Link href="/">home page</Link>, <Link href="/login">sign in</Link>, or{" "}
          <Link href="/dashboard">dashboard</Link> (after you log in).
        </p>
        <div className="error-page__actions">
          <Link href="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link href="/login" className="btn btn--secondary">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
