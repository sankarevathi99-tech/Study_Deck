import { useRef, useState } from "react";
import Header from "./components/Header.jsx";
import PromptInput from "./components/PromptInput.jsx";
import EmptyState from "./components/EmptyState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import ResultView from "./components/ResultView.jsx";
import { generateStudyDeck } from "./lib/api.js";
import { validateResult } from "./lib/validateResult.js";

/**
 * App.jsx is the single state machine for the whole product:
 *
 *   free-form input
 *        v
 *   API request (lib/api.js)
 *        v
 *   Gemini (server-side only)
 *        v
 *   JSON parsing + Zod validation (server)
 *        v
 *   frontend validation (lib/validateResult.js)
 *        v
 *   React state (this file)
 *        v
 *   interactive flashcard UI (components/ResultView + FlashcardDeck)
 *
 * `status` drives exactly what's on screen: "idle" | "loading" | "error" | "result".
 */
export default function App() {
  const [status, setStatus] = useState("idle");
  const [deck, setDeck] = useState(null);
  const [errorReason, setErrorReason] = useState("");

  // --- Stale-response protection ---
  // requestIdRef increments on every new submission. When a request
  // resolves, we only apply its result if its id still matches the
  // latest one — otherwise a slow, older request could overwrite a
  // newer, faster one.
  const requestIdRef = useRef(0);
  // abortControllerRef lets a new submission cancel the previous
  // in-flight request outright, rather than just ignoring its result.
  const abortControllerRef = useRef(null);

  async function handleSubmit(input) {
    // Cancel whatever request is currently in flight.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const thisRequestId = ++requestIdRef.current;

    setStatus("loading");
    setErrorReason("");

    try {
      const data = await generateStudyDeck(input, controller.signal);

      // A newer request has started since this one was sent — drop this
      // result entirely rather than letting it overwrite the UI.
      if (thisRequestId !== requestIdRef.current) return;

      const validation = validateResult(data);
      if (!validation.valid) {
        setErrorReason(validation.reason);
        setStatus("error");
        return;
      }

      setDeck(validation.deck);
      setStatus("result");
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return; // stale error, ignore
      setErrorReason(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setErrorReason("");
  }

  function handleNewDeck() {
    setDeck(null);
    setStatus("idle");
    setErrorReason("");
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        {status !== "result" && (
          <div className="hero">
            <h1>
              Learn less like a reader.
              <br />
              Recall more like an expert.
            </h1>
            <p className="hero-sub">
              Give the model messy notes. Get back a structured, interactive study deck.
            </p>
          </div>
        )}

        {status !== "result" && (
          <PromptInput onSubmit={handleSubmit} disabled={status === "loading"} />
        )}

        {status === "idle" && <EmptyState />}
        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState reason={errorReason} onRetry={handleRetry} />}
        {status === "result" && deck && <ResultView deck={deck} onNewDeck={handleNewDeck} />}
      </main>
    </div>
  );
}
