# FLAM Study Deck

A small AI-powered study assistant that turns a topic or study notes into an interactive flashcard deck.

The goal of this project is to help students revise using **active recall** instead of simply reading AI-generated explanations. The application uses a React frontend, an Express backend, and the Groq API to generate structured study cards.

> **Note:** This project is currently configured to run locally. It has not been deployed.

---

## Features

* Enter a topic or free-form study notes.
* Generate a study deck using a real LLM.
* API key is kept on the backend and is never exposed to the React frontend.
* AI output is returned as structured JSON.
* Validate the AI response before displaying it.
* Interactive flashcards with flip functionality.
* Mark cards as **I Know** or **Review Again**.
* Track progress while going through the deck.
* Retest cards that need more revision.
* Finish screen showing the revision result.
* Create another deck without refreshing the page.
* Loading, empty, and error states.
* Handles malformed or unexpected AI responses.
* Prevents an older API response from replacing a newer request.
* Responsive layout for smaller screens.

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv
* Zod

### AI

* Groq API
* OpenAI-compatible API
* `openai` npm package

The LLM is accessed only from the backend.

---

## How the Application Works

The application follows this flow:

```text
User enters a topic / study notes
              ↓
        React Frontend
              ↓
      POST /api/generate
              ↓
       Express Backend
              ↓
          Groq API
              ↓
      Structured JSON
              ↓
       JSON.parse()
              ↓
       Zod Validation
              ↓
       Valid response?
          /       \
        Yes       No
         ↓         ↓
     React UI    Error UI
```

The important part is that the browser never directly communicates with Groq using the secret API key.

---

## Project Structure

```text
flam-study-deck/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PromptInput.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── ResultView.jsx
│   │   │   └── FlashcardDeck.jsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── validateResult.js
│   │   │
│   │   ├── types/
│   │   │   └── result.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── index.js
│   ├── generate.js
│   ├── schema.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── package.json
├── README.md
└── AI_BUILD_PROMPT.txt
```

---

# Getting Started

## 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd flam-study-deck
```

---

## 2. Install backend dependencies

```bash
cd server
npm install
```

---

## 3. Add the Groq API key

Create a file named:

```text
server/.env
```

Add:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
PORT=8787
GROQ_MODEL=openai/gpt-oss-120b
```

Replace `YOUR_GROQ_API_KEY` with your own Groq API key.

**Do not commit this file to GitHub.**

The `.gitignore` file excludes `.env` files so that the API key is not accidentally uploaded.

---

## 4. Start the backend

From the `server` directory:

```bash
npm start
```

The backend runs on:

```text
http://localhost:8787
```

You can check whether the server is running by opening:

```text
http://localhost:8787/api/health
```

The response should be:

```json
{
  "status": "ok"
}
```

---

## 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 6. Start the frontend

```bash
npm run dev
```

Vite will display the local development URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# Using the Application

1. Enter a topic or paste study notes.
2. Click **Generate Study Deck**.
3. The frontend sends the input to the Express backend.
4. The backend sends the request to Groq.
5. Groq returns a JSON study deck.
6. The backend parses and validates the response.
7. The frontend validates the received data again.
8. The flashcards are displayed.
9. Flip each card to view the answer.
10. Mark cards as **I Know** or **Review Again**.
11. Complete the deck to see your progress.
12. Retest the cards that need more revision if required.

---

# AI Response Format

The model is instructed to return a study deck in the following structure:

```json
{
  "title": "JavaScript Basics",
  "subtitle": "Quick active-recall revision",
  "topic": "JavaScript",
  "cards": [
    {
      "id": "card-1",
      "question": "What is a closure in JavaScript?",
      "answer": "A closure is a function together with access to variables from its surrounding lexical scope.",
      "hint": "Think of a function carrying its surrounding environment with it.",
      "difficulty": "medium"
    }
  ]
}
```

A deck contains between **3 and 12 cards**, with the model normally instructed to generate 5–8 cards.

Each card contains:

* `id`
* `question`
* `answer`
* `hint`
* `difficulty`

---

# Validation

AI output cannot be assumed to be correct just because it came from an LLM.

The backend performs:

```text
LLM response
     ↓
JSON.parse()
     ↓
Zod schema validation
     ↓
Valid?
```

The Zod schema checks:

* Required fields exist.
* Strings are not empty.
* `cards` is an array.
* At least 3 cards are present.
* No more than 12 cards are present.
* Every card contains the required fields.
* Difficulty is one of:

  * `easy`
  * `medium`
  * `hard`
* Card IDs are unique.

The frontend also performs validation before rendering the result.

This gives the application a second layer of protection against unexpected AI output.

---

# Error Handling

The application handles several failure cases instead of assuming that the AI will always respond correctly.

### Empty input

If the user submits an empty topic, the request is rejected before calling the AI.

### Empty AI response

If the AI returns no content, the backend returns an error instead of sending an invalid result to the frontend.

### Malformed JSON

If the AI response cannot be parsed using `JSON.parse()`, the application displays an error.

### Incorrect JSON structure

If the response does not match the expected schema, Zod validation fails and the invalid data is not rendered.

### API failure

If the AI provider cannot be reached, the user receives an error state with an option to try again.

### Slow requests

The frontend uses a request timeout so that the interface does not remain in a loading state indefinitely.

### Stale responses

If the user submits another request while an earlier request is still running, an older response is prevented from replacing the newer result.

### Loading state

While the deck is being generated, the interface clearly indicates that generation is in progress.

---

# Security

The Groq API key is stored only on the backend.

The frontend does **not** contain the API key.

The browser communicates with:

```text
React → Express
```

and the Express server communicates with:

```text
Express → Groq
```

The key is loaded using:

```js
process.env.GROQ_API_KEY
```

The `.env` file is intentionally excluded from Git.

For a deployed version, the same key should be stored using the hosting provider's environment-variable/secret settings rather than committing it to the repository.

---

# Why a Backend Was Used

The backend acts as a small proxy between the frontend and the AI provider.

This provides two important benefits:

1. The API key remains private.
2. AI output can be validated before it reaches the UI.

It also keeps the AI integration separate from the React components.

The main backend responsibilities are:

```text
Validate request
      ↓
Call LLM
      ↓
Parse response
      ↓
Validate response
      ↓
Return safe structured data
```

---

# Interactive Study Experience

This is intentionally designed as a **study tool rather than a chatbot**.

Instead of showing a long AI response, the application converts the generated content into flashcards.

The user can:

* Reveal answers.
* Move through cards.
* Track progress.
* Mark cards they know.
* Flag cards for review.
* Retest the cards they struggled with.

This makes the generated content more useful for active recall.

---

# AI Usage

AI tools were used during development to help with implementation ideas, debugging, component structure, and boilerplate.

The generated code was reviewed and adapted for this project.

The core application flow, including:

* API communication
* JSON parsing
* schema validation
* error handling
* stale request handling
* flashcard state management
* UI interactions

was reviewed so that the implementation could be explained and modified during an interview.

---

# Known Limitations

* The application currently requires a Groq API key to generate decks.
* The project is currently intended for local development and has not been deployed.
* Generated content depends on the quality and relevance of the user's input and the LLM response.
* AI-generated answers may still contain factual mistakes, so users should verify important academic information.
* There is currently no authentication or user account system.
* Generated decks are not permanently stored in a database.
* There is no history of previously generated decks after the application is refreshed.

---

# Future Improvements

Some possible improvements for a future version are:

* Save generated decks.
* Add deck history.
* Add difficulty filtering.
* Allow users to edit generated cards.
* Add spaced-repetition scheduling.
* Add progress statistics.
* Add authentication.
* Deploy the frontend and backend.
* Support additional LLM providers.

These features were intentionally kept outside the current assignment scope.

---

# Assignment Scope

The project was built around the following requirements:

* React-based frontend.
* Free-form text input.
* Real LLM integration.
* Backend/serverless proxy.
* Secret API key kept away from the frontend.
* Structured JSON response.
* JSON parsing and validation.
* Stateful interactive UI.
* Loading state.
* Error state.
* Empty state.
* Handling malformed or unexpected AI responses.
* Responsive UI.
* README documentation.

Authentication and a production database were not required for this assignment.

---

# Time Spent

Approximately **8 hours**, including:

* Project setup
* UI implementation
* Backend/API integration
* LLM prompt design
* JSON parsing and validation
* Error handling
* Interactive flashcard functionality
* Testing and debugging
* Documentation

---

# Demo

The demo shows:

1. Starting the application.
2. Entering a study topic.
3. Generating a study deck.
4. Viewing the generated flashcards.
5. Flipping a card to reveal the answer.
6. Marking cards for review.
7. Completing the deck.
8. Retesting cards that need revision.
9. Creating another deck.

---

# License

This project was created as part of the FLAM Frontend Internship assignment.
