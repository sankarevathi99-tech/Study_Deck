/**
 * Shown while the request to /api/generate is in flight. Never leave the
 * screen blank during an async call — always show intent.
 */
export default function LoadingState() {
  return (
    <section className="loading-state" role="status" aria-live="polite">
      <h2>Building your study deck</h2>
      <p>
        Extracting concepts, writing questions,
        <br />
        and shaping them into validated flashcards.
      </p>
      <div className="loading-bar" aria-hidden="true">
        <div className="loading-bar-fill" />
      </div>
    </section>
  );
}
