import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function ruleBasedResponse(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("emergency")) {
    return (
      "If this is an emergency, call your local emergency number immediately or go to the nearest emergency room. " +
      "If you can, share your location and what’s happening so someone nearby can help."
    );
  }

  if (text.includes("fever")) {
    return (
      "Fever can have many causes. Consider resting, staying hydrated, and monitoring your temperature. " +
      "If you have severe symptoms, a very high fever, or it lasts more than 1–2 days, consult a doctor."
    );
  }

  if (text.includes("pain")) {
    return (
      "I’m sorry you’re in pain. Where is the pain located, how severe is it (1–10), and how long has it been happening? " +
      "If it’s sudden/severe or accompanied by chest pain, breathing trouble, fainting, or weakness, seek urgent care."
    );
  }

  return (
    "Thanks for sharing. Can you describe your symptoms, how long they’ve been present, and any relevant history (age, meds, allergies)? " +
    "If you feel unsafe or symptoms are severe, please seek urgent medical help."
  );
}

async function openAiResponse(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });

  const prompt =
    "You are a healthcare support assistant. Provide general, non-diagnostic information only. " +
    "Be concise, ask 1-2 clarifying questions if needed, and always include a short safety note for severe symptoms.\n\n" +
    `User: ${message}`;

  const result = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt,
  });

  const text =
    result.output_text ||
    (Array.isArray(result.output) ? result.output.map((o) => JSON.stringify(o)).join("\n") : "");

  return (text || "").trim() || null;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' (string) in request body." });
    }

    let reply = null;
    try {
      reply = await openAiResponse(message);
    } catch (_e) {
      reply = null; // fallback to rules if OpenAI fails
    }

    if (!reply) reply = ruleBasedResponse(message);

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

