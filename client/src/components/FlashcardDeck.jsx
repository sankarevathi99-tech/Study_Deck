import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

/**
 * FlashcardDeck owns the entire study *session*: which card is showing,
 * whether it's flipped, which cards the user knows vs. wants to review,
 * and the retest-only-review-cards loop. The deck DATA (questions,
 * answers, hints) is fully validated before this component ever mounts —
 * this component only deals with trusted, already-shaped data.
 *
 * @param {Object} props
 * @param {import('../types/result').StudyDeck} props.deck
 * @param {() => void} props.onNewDeck
 */
export default function FlashcardDeck({ deck, onNewDeck }) {
  const totalCards = deck.cards.length;

  // The cards currently being worked through. Starts as the full deck;
  // becomes "only the review cards" when the user chooses to retest.
  const [queue, setQueue] = useState(deck.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState("studying"); // "studying" | "finished"

  // Latest verdict per card id, across the whole session (including
  // retests). This is what mastery % is calculated from.
  const [statusMap, setStatusMap] = useState({}); // { [cardId]: "known" | "review" }
  const [roundJudged, setRoundJudged] = useState(0); // judged in the CURRENT round, for the progress text

  const currentCard = queue[index];

  const markCard = useCallback(
    (status) => {
      if (!currentCard) return;
      setStatusMap((prev) => ({ ...prev, [currentCard.id]: status }));
      setRoundJudged((n) => n + 1);

      if (index + 1 < queue.length) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else {
        setPhase("finished");
      }
    },
    [currentCard, index, queue.length]
  );

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, queue.length - 1));
    setFlipped(false);
  }, [queue.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    setFlipped(false);
  }, []);

  // Keyboard controls: Space flips, ArrowLeft/ArrowRight move between
  // cards without forcing a verdict (handy for re-checking a card).
  useEffect(() => {
    if (phase !== "studying") return;
    function handleKeyDown(e) {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        goNext();
      } else if (e.code === "ArrowLeft") {
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, goNext, goPrev]);

  const knownCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === "known").length,
    [statusMap]
  );
  const reviewIds = useMemo(
    () => Object.keys(statusMap).filter((id) => statusMap[id] === "review"),
    [statusMap]
  );
  const masteryPercent = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

  function handleRetestReview() {
    const cardsToRetest = deck.cards.filter((c) => reviewIds.includes(c.id));
    setQueue(cardsToRetest);
    setIndex(0);
    setFlipped(false);
    setRoundJudged(0);
    setPhase("studying");
  }

  if (phase === "finished") {
    return (
      <section className="finish-screen">
        <CheckCircle2 size={32} aria-hidden="true" />
        <h2 className="finish-title">Deck complete</h2>
        <p className="finish-mastery">{masteryPercent}% mastered</p>
        <p className="finish-detail">
          You marked {knownCount} of {totalCards} cards as known.
        </p>

        <div className="finish-actions">
          {reviewIds.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={handleRetestReview}>
              <RotateCcw size={16} aria-hidden="true" />
              Retest {reviewIds.length} to review
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onNewDeck}>
            <Sparkles size={16} aria-hidden="true" />
            Create another deck
          </button>
        </div>
      </section>
    );
  }

  const progressPercent = ((index + 1) / queue.length) * 100;

  return (
    <section className="deck-session">
      <div className="deck-progress" aria-live="polite">
        <div className="deck-progress-row">
          <span>
            {index + 1} / {queue.length}
          </span>
          <span>{roundJudged} reviewed</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div
        className={`flashcard ${flipped ? "flashcard-flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Showing answer. Press to flip back." : "Showing question. Press to reveal answer."}
        onKeyDown={(e) => {
          if (e.key === "Enter") setFlipped((f) => !f);
        }}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className={`difficulty-badge difficulty-${currentCard.difficulty}`}>
              {currentCard.difficulty}
            </span>
            <p className="flashcard-label">Question</p>
            <p className="flashcard-text">{currentCard.question}</p>
            <p className="flashcard-hint-cta">SPACE or click to reveal</p>
          </div>
          <div className="flashcard-face flashcard-back">
            <p className="flashcard-label">Answer</p>
            <p className="flashcard-text">{currentCard.answer}</p>
            <p className="flashcard-memory-label">Memory hook</p>
            <p className="flashcard-memory-text">{currentCard.hint}</p>
          </div>
        </div>
      </div>

      <div className="deck-actions">
        <button
          type="button"
          className="btn btn-review"
          disabled={!flipped}
          onClick={() => markCard("review")}
        >
          Review again
        </button>
        <button
          type="button"
          className="btn btn-known"
          disabled={!flipped}
          onClick={() => markCard("known")}
        >
          I know it
        </button>
      </div>
    </section>
  );
}
