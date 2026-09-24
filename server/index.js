/**
 * index.js
 *
 * Thin Express server. Its jobs are:
 *   1. Validate the incoming request body.
 *   2. Call generateStudyDeck() to communicate with Groq.
 *   3. Return { data } on success or { error } on failure.
 *
 * The Groq API key is never exposed to the frontend.
 * It is stored in server/.env and accessed through process.env.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { generateStudyDeck } from "./generate.js";

const app = express();
const PORT = process.env.PORT || 8787;
const MAX_INPUT_LENGTH = 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate", async (req, res) => {
  const { input } = req.body ?? {};

  if (typeof input !== "string") {
    return res
      .status(400)
      .json({ error: "Please enter a topic or some study notes." });
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return res
      .status(400)
      .json({ error: "Please enter a topic or some study notes." });
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({
      error: `Please keep your notes under ${MAX_INPUT_LENGTH} characters.`,
    });
  }

  try {
    const data = await generateStudyDeck(trimmed);

    return res.json({ data });
  } catch (err) {
    const message =
      err instanceof Error && isKnownFailure(err.message)
        ? err.message
        : "We couldn't reach the study generator. Please try again.";

    console.error("[/api/generate] failed:", err);

    return res.status(502).json({ error: message });
  }
});

function isKnownFailure(message) {
  return (
    message.includes("empty response") ||
    message.includes("malformed JSON") ||
    message.includes("expected study-deck shape") ||
    message.includes("GROQ_API_KEY")
  );
}

app.listen(PORT, () => {
  console.log(`FLAM Study Deck server listening on port ${PORT}`);
});