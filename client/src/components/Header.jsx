import { BrainCircuit } from "lucide-react";

/**
 * Simple top bar. Purely presentational — no state, no logic. Kept
 * separate from App.jsx so the interviewer can see the UI decomposed
 * into clearly-scoped pieces.
 */
export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <BrainCircuit size={22} aria-hidden="true" />
        <span className="brand-name">FLAM Study</span>
      </div>
      <span className="brand-tag">AI-powered active recall</span>
    </header>
  );
}
