import { ShieldCheck, Layers, RotateCcw, Target } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Structured",
    body: "AI output is validated before it reaches the UI.",
  },
  {
    icon: Layers,
    title: "Interactive",
    body: "Flip cards and decide whether you know each answer.",
  },
  {
    icon: RotateCcw,
    title: "Adaptive",
    body: "Retest only the cards you mark for review.",
  },
  {
    icon: Target,
    title: "Focused",
    body: "One free-form prompt becomes a clear study workflow.",
  },
];

/**
 * Shown before the user has generated a deck. Purely presentational.
 */
export default function EmptyState() {
  return (
    <section className="empty-state">
      <p className="empty-eyebrow">Your notes in. Active recall out.</p>
      <p className="empty-body">
        Paste any topic or notes above. FLAM turns them into a focused
        flashcard deck—not a chat transcript.
      </p>

      <div className="feature-grid">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div className="feature-card" key={title}>
            <Icon size={18} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
