import { useState } from "react";
import { Sparkles } from "lucide-react";

const PLACEHOLDER = `Paste notes, a topic, or an interview concept…

Example:
Explain DBMS normalization with 1NF, 2NF, 3NF, BCNF, examples and common interview mistakes.`;

const MAX_LENGTH = 5000;

/**
 * Free-form textarea + submit button. This is the ONLY information input
 * in the whole app — deliberately, so the data contract stays simple:
 * one string in, one validated deck out.
 *
 * @param {Object} props
 * @param {(input: string) => void} props.onSubmit
 * @param {boolean} props.disabled - true while a request is in flight
 */
export default function PromptInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <textarea
        className="prompt-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={PLACEHOLDER}
        maxLength={MAX_LENGTH}
        disabled={disabled}
        aria-label="Study notes or topic"
        rows={6}
      />
      <div className="prompt-footer">
        <span className="prompt-count" aria-live="polite">
          {value.length} / {MAX_LENGTH}
        </span>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled || !value.trim()}
        >
          <Sparkles size={16} aria-hidden="true" />
          Build my deck
        </button>
      </div>
    </form>
  );
}
