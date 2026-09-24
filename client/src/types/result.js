/**
 * types/result.js
 *
 * Plain JavaScript project — no TypeScript — but we still document the
 * expected shape with JSDoc typedefs so components and the validator
 * agree on exactly what a "study deck" looks like.
 *
 * This MUST stay in sync with server/schema.js. The backend enforces this
 * shape with Zod; the frontend enforces it again with validateResult.js.
 * Neither side trusts the other blindly.
 *
 * @typedef {"easy" | "medium" | "hard"} Difficulty
 *
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 * @property {string} hint
 * @property {Difficulty} difficulty
 *
 * @typedef {Object} StudyDeck
 * @property {string} title
 * @property {string} subtitle
 * @property {string} topic
 * @property {Card[]} cards
 */

// No runtime exports needed — this file exists purely for the JSDoc types
// above, which editors can pick up via `@type {import('./types/result').StudyDeck}`.
export {};
