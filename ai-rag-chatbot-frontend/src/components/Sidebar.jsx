import { MessageSquare, Plus, Trash2, Sparkles, PanelLeftClose, LoaderCircle } from "lucide-react";
import { formatDistanceToNow } from "./dateUtils.js";
import "./Sidebar.css";

export default function Sidebar({
  sessions,
  activeSessionId,
  loading,
  creating,
  open,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose
}) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Sparkles size={19} /></div>
        <div className="brand-copy">
          <strong>Nova AI</strong>
          <span>Personal assistant</span>
        </div>
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <button className="new-chat-button" onClick={onNewChat} disabled={creating}>
        {creating ? <LoaderCircle className="spin" size={17} /> : <Plus size={18} />}
        <span>New conversation</span>
      </button>

      <div className="history-label">YOUR CHATS</div>
      <div className="session-list">
        {loading ? (
          <div className="sidebar-message"><LoaderCircle className="spin" size={16} /> Loading chats…</div>
        ) : sessions.length === 0 ? (
          <div className="sidebar-empty">Your conversations will appear here.</div>
        ) : (
          sessions.map((session) => (
            <div
              className={`session-row ${session.id === activeSessionId ? "session-active" : ""}`}
              key={session.id}
            >
              <button className="session-select" onClick={() => onSelectSession(session.id)}>
                <MessageSquare size={16} />
                <span className="session-copy">
                  <span className="session-title">{session.title || "New conversation"}</span>
                  <span className="session-time">{formatDistanceToNow(session.updatedAt || session.createdAt)}</span>
                </span>
              </button>
              <button
                className="session-delete"
                aria-label={`Delete ${session.title || "conversation"}`}
                title="Delete conversation"
                onClick={() => onDeleteSession(session.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="provider-pill"><span className="status-dot" /> Google Gemini connected through backend</div>
        <div className="sidebar-note">Your chats are saved in your local database.</div>
      </div>
    </aside>
  );
}