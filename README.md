# Healthcare Support Assistant (Full-Stack)

A full-stack healthcare support web app with:
- A **chatbot-style interface** (rule-based replies + optional OpenAI fallback)
- A **Patient Support Form** to submit a request for follow-up

> **Disclaimer:** This app provides general information only. **This is not medical advice. Please consult a professional.**

## Project overview

This project is built as a simple single-page app where users can:
- Ask health-related questions in a chat UI (user + bot messages)
- Submit their contact/support request using a form

The backend exposes a small API (`POST /chat`) that returns a response using:
- **Rule-based logic** (always available)
- **Optional OpenAI integration** if `OPENAI_API_KEY` is set (falls back to rules if not set or if OpenAI fails)

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Styling:** Simple CSS (no heavy UI libraries)

## AI / automation idea (rule-based logic)

The backend checks the user message and responds using simple rules:
- If message contains **"fever"** → suggest hydration + consulting a doctor
- If message contains **"pain"** → ask for more details / suggest checkup
- If message contains **"emergency"** → show urgent help message
- Otherwise → generic helpful response

If OpenAI is enabled, the app attempts an AI response first and **falls back** to the rules automatically.

## Folder structure

```
internship assignment fullstack ai/
  client/                  # React (Vite) frontend
    src/
      App.jsx              # Chatbot UI + Patient Support Form
      App.css              # Page styling
      main.jsx             # React entry
      index.css            # Global CSS
    vite.config.js         # Dev proxy: /chat -> http://localhost:3001
    package.json

  server/                  # Node + Express backend
    index.js               # API endpoints + rule logic + optional OpenAI
    package.json
```

## How to run locally (development)

### 1) Start the backend

In a terminal:

```bash
cd server
npm install
npm run dev
```

Backend runs at `http://localhost:3001`.

Quick test:
- `GET /health` → should return `{ ok: true }`

### 2) Start the frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at the Vite URL shown in the terminal (usually `http://localhost:5173`).

The frontend calls the backend using `fetch("/chat")`. In development this works because of the Vite proxy in `client/vite.config.js`.

## API reference

### `POST /chat`

**Request body**

```json
{ "message": "I have fever since yesterday" }
```

**Response**

```json
{ "reply": "..." }
```

## Environment variables (optional OpenAI)

Create `server/.env` (optional):

```bash
OPENAI_API_KEY=your_key_here
# Optional:
OPENAI_MODEL=gpt-4.1-mini
```

Notes:
- If `OPENAI_API_KEY` is **not** set, the backend uses the rule-based responses.
- If OpenAI errors for any reason, the backend **falls back** to rules.

## Deployment

### Deploy backend on Render

1. Push your project to GitHub.
2. In Render, create a **New Web Service** from your repo.
3. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables in Render:
   - `OPENAI_API_KEY` (optional)
   - `OPENAI_MODEL` (optional)
5. Render will provide a public backend URL (example: `https://your-service.onrender.com`).

### Deploy frontend on Vercel

1. In Vercel, create a **New Project** from your repo.
2. Set:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
3. Configure the backend URL:
   - Easiest approach: update the frontend fetch to use a full backend URL in production, or add a Vercel rewrite.

**Recommended (simple) approach: use an environment variable**

Update the frontend to use a base URL like `import.meta.env.VITE_API_BASE_URL` and set it in Vercel:
- `VITE_API_BASE_URL = https://your-backend.onrender.com`

If you want, tell me your preferred deployment style and I can wire this environment variable in the frontend cleanly.

## NGO / community health use-case

This app can help an NGO or community health team:
- Collect basic symptom queries and provide **general guidance**
- Encourage safe next steps (hydration, monitoring, professional consultation)
- Flag urgent messages (e.g., “emergency”) with strong safety instructions
- Gather follow-up requests using the Patient Support Form

## Important safety note

This project is intentionally simple and **does not diagnose** medical conditions.
Always advise users to consult qualified healthcare professionals for medical decisions.

