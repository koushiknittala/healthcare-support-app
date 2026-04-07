import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function buildWelcomeMessage() {
  return {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    role: "bot",
    text: "Hi! Describe what you’re experiencing, and I’ll share general guidance and next steps.",
  };
}

export default function App() {
  const [messages, setMessages] = useState([buildWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);
  const [supportForm, setSupportForm] = useState({ name: "", issue: "", message: "" });
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  useEffect(() => {
    // Keep the most recent message in view.
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText =
        res.ok && typeof data.reply === "string"
          ? data.reply
          : "Sorry—something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
          role: "bot",
          text: replyText,
        },
      ]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
          role: "bot",
          text: "I couldn’t reach the server. Make sure the backend is running, then try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function onSupportChange(e) {
    const { name, value } = e.target;
    setSupportForm((prev) => ({ ...prev, [name]: value }));
  }

  function onSupportSubmit(e) {
    e.preventDefault();
    setSupportSubmitted(true);
    setSupportForm({ name: "", issue: "", message: "" });
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">Healthcare Support Assistant</h1>
          <p className="subtitle">Ask a health question and get general guidance.</p>
        </div>
      </header>

      <main className="stack">
        <section className="card formCard" aria-label="Patient support form">
          <div className="formHeader">
            <h2 className="sectionTitle">Patient Support Form</h2>
            <p className="sectionHint">Submit a request and our team will follow up.</p>
          </div>

          <form className="supportForm" onSubmit={onSupportSubmit}>
            <label className="field">
              <span className="labelText">Name</span>
              <input
                className="control"
                name="name"
                value={supportForm.name}
                onChange={onSupportChange}
                placeholder="Your name"
              />
            </label>

            <label className="field">
              <span className="labelText">Issue</span>
              <input
                className="control"
                name="issue"
                value={supportForm.issue}
                onChange={onSupportChange}
                placeholder="e.g., fever, pain, follow-up"
              />
            </label>

            <label className="field">
              <span className="labelText">Message</span>
              <textarea
                className="control textarea"
                name="message"
                value={supportForm.message}
                onChange={onSupportChange}
                placeholder="Share details (optional)"
                rows={4}
              />
            </label>

            <div className="formActions">
              <button className="send" type="submit">
                Submit
              </button>
              {supportSubmitted && (
                <div className="confirmation" role="status">
                  Your request has been submitted. Our team will contact you soon.
                </div>
              )}
            </div>
          </form>
        </section>

        <section className="card" aria-label="Chatbot">
        <div className="chat" ref={listRef} aria-label="Chat messages">
          {messages.map((m) => (
            <div key={m.id} className={`row ${m.role === "user" ? "right" : "left"}`}>
              <div className={`bubble ${m.role}`}>
                <div className="meta">{m.role === "user" ? "You" : "Support bot"}</div>
                <div className="text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={onSubmit}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Example: "I have fever since yesterday"'
            aria-label="Type your message"
          />
          <button className="send" type="submit" disabled={!canSend}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
        </section>
      </main>

      <footer className="footer">
        <div>
          If symptoms are severe or you feel unsafe, contact local emergency services or a healthcare professional.
        </div>
        <div className="footerDisclaimer">This is not medical advice. Please consult a professional.</div>
      </footer>
    </div>
  );
}

