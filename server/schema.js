/**
 * schema.js
 *
 * This is the single source of truth for what a valid "study deck" looks
 * like. Gemini's raw output is treated as UNTRUSTED external data — it is
 * parsed as JSON and then run through this Zod schema before the backend
 * will ever send it to the frontend.
 *
 * Data contract (see README for the full spec):
 * {
 *   title: string,
 *   subtitle: string,
 *   topic: string,
 *   cards: [
 *     { id, question, answer, hint, difficulty: "easy"|"medium"|"hard" }
 *   ]
 * }
 */

import { z } from "zod";

const nonEmptyString = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} must not be empty`);

export const CardSchema = z.object({
  id: nonEmptyString("card.id"),
  question: nonEmptyString("card.question"),
  answer: nonEmptyString("card.answer"),
  hint: nonEmptyString("card.hint"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "difficulty must be easy, medium, or hard" }),
  }),
});

export const StudyDeckSchema = z
  .object({
    title: nonEmptyString("title"),
    subtitle: nonEmptyString("subtitle"),
    topic: nonEmptyString("topic"),
    cards: z
      .array(CardSchema)
      .min(3, "A deck must have at least 3 cards")
      .max(12, "A deck must have at most 12 cards"),
  })
  .superRefine((deck, ctx) => {
    // Reject duplicate card IDs. Duplicate IDs would break React's `key`
    // usage on the frontend and make review-set tracking unreliable.
    const seen = new Set();
    deck.cards.forEach((card, index) => {
      if (seen.has(card.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate card id found: "${card.id}"`,
          path: ["cards", index, "id"],
        });
      }
      seen.add(card.id);
    });
  });

/**
 * The JSON Schema handed to Gemini so it can constrain its own output
 * (responseSchema + responseMimeType: "application/json"). This mirrors
 * StudyDeckSchema above but in the plain JSON-Schema shape the Gemini API
 * expects. We still re-validate with Zod afterwards — never trust the
 * model just because we asked nicely.
 */
export const geminiResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    topic: { type: "string" },
    cards: {
      type: "array",
      minItems: 3,
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          answer: { type: "string" },
          hint: { type: "string" },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
        },
        required: ["id", "question", "answer", "hint", "difficulty"],
        propertyOrdering: ["id", "question", "answer", "hint", "difficulty"],
      },
    },
  },
  required: ["title", "subtitle", "topic", "cards"],
  propertyOrdering: ["title", "subtitle", "topic", "cards"],
};
