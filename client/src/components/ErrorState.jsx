import { AlertTriangle } from "lucide-react";

/**
 * Shown whenever anything goes wrong: network failure, malformed JSON,
 * wrong shape, empty response, timeout, or frontend validation failure.
 * The `reason` string is always human-readable and safe to display —
 * see lib/api.js and lib/validateResult.js for where these are produced.
 *
 * @param {Object} props
 * @param {string} props.reason
 * @param {() => void} props.onRetry
 */
export default function ErrorState({ reason, onRetry }) {
  return (
    <section className="error-state" role="alert">
      <AlertTriangle size={22} aria-hidden="true" />
      <h2>We couldn't build that deck.</h2>
      <p>{reason}</p>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}
