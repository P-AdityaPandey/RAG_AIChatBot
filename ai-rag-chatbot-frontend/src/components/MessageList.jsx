import { Bot, UserRound, Copy, Check } from "lucide-react";
import { useState } from "react";
import "./MessageList.css";

function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = String(message.role || "").toUpperCase() === "USER";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard access may be unavailable in some browser contexts.
    }
  }

  return (
    <article className={`message-row ${isUser ? "message-user" : "message-assistant"}`}>
      <div className={`message-avatar ${isUser ? "avatar-user" : "avatar-assistant"}`}>
        {isUser ? <UserRound size={17} /> : <Bot size={18} />}
      </div>
      <div className="message-body">
        <div className="message-meta">
          <strong>{isUser ? "You" : "Gemini"}</strong>
          <span>{message.pending ? "Sending…" : formatTime(message.createdAt)}</span>
        </div>
        <div className={`message-content ${isUser ? "user-content" : ""}`}>
          {message.content}
        </div>
        {!isUser && !message.pending && Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="message-sources">
            <strong>Sources used</strong>
            <div className="message-source-list">
              {message.sources.map((source, index) => (
                <div className="message-source" key={`${source.documentId || source.fileName}-${source.chunkIndex ?? index}`}>
                  <span>{source.fileName}</span>
                  {source.chunkIndex != null && <small>Chunk {source.chunkIndex + 1}</small>}
                  {source.excerpt && <p>{source.excerpt}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isUser && !message.pending && (
          <button className="copy-message" onClick={copyMessage} aria-label="Copy response">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>
    </article>
  );
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageList({ messages, sending }) {
  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message, index) => (
        <MessageBubble key={message.id || `${message.role}-${index}`} message={message} />
      ))}
      {sending && (
        <div className="typing-indicator">
          <div className="message-avatar avatar-assistant"><Bot size={18} /></div>
          <div className="typing-dots" aria-label="Gemini is responding"><i /><i /><i /></div>
          <span>Gemini is thinking…</span>
        </div>
      )}
    </div>
  );
}