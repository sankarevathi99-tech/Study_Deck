import FlashcardDeck from "./FlashcardDeck.jsx";

/**
 * Wraps the validated deck data with its title/subtitle and hands the
 * interactive session off to FlashcardDeck. Kept separate so
 * FlashcardDeck can stay focused purely on session state.
 *
 * @param {Object} props
 * @param {import('../types/result').StudyDeck} props.deck
 * @param {() => void} props.onNewDeck
 */
export default function ResultView({ deck, onNewDeck }) {
  return (
    <section className="result-view">
      <div className="deck-header">
        <h2>{deck.title}</h2>
        <p>{deck.subtitle}</p>
      </div>
      <FlashcardDeck deck={deck} onNewDeck={onNewDeck} />
    </section>
  );
}
