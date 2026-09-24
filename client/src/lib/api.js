/**
 * lib/api.js
 *
 * The ONLY file in the React app that talks to the backend. Every other
 * component goes through generateStudyDeck() below — nothing in the UI
 * ever calls Gemini, and nothing in the UI ever sees an API key.
 */

const TIMEOUT_MS = 25000;

/**
 * POSTs the user's free-form notes to the backend and returns the parsed
 * JSON body. Callers are responsible for validating `data` before
 * rendering it (see lib/validateResult.js).
 *
 * @param {string} input - free-form study notes / topic
 * @param {AbortSignal} [externalSignal] - lets the caller cancel this request
 *   (used for stale-response protection when a newer request starts).
 */
export async function generateStudyDeck(input, externalSignal) {
  const controller = new AbortController();

  // If the caller aborts (e.g. a newer request superseded this one),
  // forward that abort to our own controller.
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  // Enforce a hard timeout so a hung request can't spin forever.
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // During local development:
  // VITE_API_URL is not required, so localhost is used.
  //
  // After deployment:
  // VITE_API_URL will contain your Render backend URL.
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8787";

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    let body;

    try {
      body = await response.json();
    } catch {
      throw new Error(
        "We couldn't reach the study generator. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        body?.error ||
          "We couldn't reach the study generator. Please try again."
      );
    }

    return body.data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "The request took too long or was cancelled. Please try again."
      );
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}