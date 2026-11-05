import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useRef } from "react";
import "./ChatInput.css";

export default function ChatInput({ value, onChange, onSubmit, disabled, sending }) {
  const textareaRef = useRef(null);

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  }

  function handleChange(event) {
    onChange(event.target.value);
    const element = textareaRef.current;
    if (element) {
      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
    }
  }

  return (
    <div className="input-area">
      <form className="chat-composer" onSubmit={onSubmit}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Gemini…"
          aria-label="Message Gemini"
          rows={1}
          maxLength={12000}
          disabled={disabled}
        />
        <div className="composer-bottom">
          <div className="composer-hint"><Sparkles size={13} /><span>Powered by Google Gemini</span></div>
          <div className="composer-actions">
            <span className="character-count">{value.length > 0 ? `${value.length}/12000` : "Enter ↵ to send"}</span>
            <button className="send-button" type="submit" disabled={disabled || !value.trim()} aria-label="Send message">
              {sending ? <span className="send-spinner" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </form>
      <p className="input-disclaimer">AI responses may be inaccurate. Check important details.</p>
    </div>
  );
}