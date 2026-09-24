/**
 * lib/validateResult.js
 *
 * The backend already validates Gemini's output with Zod (see
 * server/schema.js). This file validates it AGAIN, on the frontend,
 * before anything gets rendered.
 *
 * Why validate twice? Because the frontend should never assume the
 * network/backend layer is trustworthy either — a proxy could be
 * misconfigured, a response could be truncated, an older API version
 * could be running, etc. Treat every external response as untrusted
 * until it passes this check, full stop.
 *
 * This is deliberately plain JS (no Zod on the client) so the checks are
 * easy to read top-to-bottom during an interview.
 *
 * @param {unknown} data
 * @returns {{ valid: true, deck: import('../types/result').StudyDeck } | { valid: false, reason: string }}
 */
export function validateResult(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, reason: "The response was not a study-deck object." };
  }

  const { title, subtitle, topic, cards } = data;

  if (!isNonEmptyString(title)) {
    return { valid: false, reason: "The deck is missing a title." };
  }
  if (!isNonEmptyString(subtitle)) {
    return { valid: false, reason: "The deck is missing a subtitle." };
  }
  if (!isNonEmptyString(topic)) {
    return { valid: false, reason: "The deck is missing a topic." };
  }
  if (!Array.isArray(cards) || cards.length < 3 || cards.length > 12) {
    return {
      valid: false,
      reason: "The deck must contain between 3 and 12 cards.",
    };
  }

  const seenIds = new Set();

  for (const [index, card] of cards.entries()) {
    if (!card || typeof card !== "object") {
      return { valid: false, reason: `Card ${index + 1} is not a valid object.` };
    }
    if (!isNonEmptyString(card.id)) {
      return { valid: false, reason: `Card ${index + 1} is missing an id.` };
    }
    if (seenIds.has(card.id)) {
      return { valid: false, reason: `Duplicate card id found: "${card.id}".` };
    }
    seenIds.add(card.id);

    if (!isNonEmptyString(card.question)) {
      return { valid: false, reason: `Card ${index + 1} is missing a question.` };
    }
    if (!isNonEmptyString(card.answer)) {
      return { valid: false, reason: `Card ${index + 1} is missing an answer.` };
    }
    if (!isNonEmptyString(card.hint)) {
      return { valid: false, reason: `Card ${index + 1} is missing a hint.` };
    }
    if (!["easy", "medium", "hard"].includes(card.difficulty)) {
      return {
        valid: false,
        reason: `Card ${index + 1} has an invalid difficulty: "${card.difficulty}".`,
      };
    }
  }

  return { valid: true, deck: data };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
