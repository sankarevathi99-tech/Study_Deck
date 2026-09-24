/**
 * generate.js
 *
 * This file owns the ONLY code path that talks to the LLM.
 */

import "dotenv/config";
import OpenAI from "openai";
import { StudyDeckSchema } from "./schema.js";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

let client;

function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is missing on the server. Add it to server/.env."
      );
    }

    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return client;
}

function buildPrompt(userInput) {
  return `You are a study-deck generator for an active-recall flashcard app.

Turn the study notes or topic below into a flashcard deck.

STUDY NOTES / TOPIC:
"""
${userInput}
"""

Rules you MUST follow:

- Return ONLY valid JSON.
- No markdown.
- No code fences.
- No explanations outside the JSON.
- The JSON must match the required structure.
- Produce between 5 and 8 cards.
- Never produce fewer than 3 cards.
- Never produce more than 12 cards.
- Every card must have a unique id.
- Every question must test active recall.
- Every answer must directly and completely answer the question.
- Every hint must be a short memory hook.
- The hint must NOT simply repeat the answer.
- difficulty must be exactly one of: easy, medium, hard.
- Avoid duplicate or near-duplicate questions.
- Prefer concepts useful for interviews or exams.
- Include common mistakes or edge cases when relevant.

Required JSON structure:

{
  "title": "string",
  "subtitle": "string",
  "topic": "string",
  "cards": [
    {
      "id": "card-1",
      "question": "string",
      "answer": "string",
      "hint": "string",
      "difficulty": "easy"
    }
  ]
}`;
}

export async function generateStudyDeck(userInput) {
  const ai = getClient();

  const response = await ai.chat.completions.create({
    model: MODEL,

    messages: [
      {
        role: "system",
        content:
          "You generate study flashcard decks. Return only valid JSON.",
      },
      {
        role: "user",
        content: buildPrompt(userInput),
      },
    ],

    temperature: 0.35,

    response_format: {
      type: "json_object",
    },
  });

  const raw = response.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    throw new Error("The AI returned an empty response.");
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The AI returned malformed JSON.");
  }

  const result = StudyDeckSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Zod validation failed:", result.error.flatten());

    throw new Error(
      "The AI response did not match the expected study-deck shape."
    );
  }

  return result.data;
}