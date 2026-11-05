import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, Menu, X, BookOpen } from "lucide-react";
import {
  createSession,
  deleteSession,
  getMessages,
  getSessions,
  sendMessage
} from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import MessageList from "./components/MessageList.jsx";
import ChatInput from "./components/ChatInput.jsx";
import EmptyState from "./components/EmptyState.jsx";
import DocumentsPanel from "./components/DocumentsPanel.jsx";
import "./App.css";

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeError(error) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const refreshSessions = useCallback(async () => {
    const data = await getSessions();
    const ordered = Array.isArray(data)
      ? [...data].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      : [];
    setSessions(ordered);
    return ordered;
  }, []);

  const loadSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    setError("");
    setSidebarOpen(false);
    if (!sessionId) return;

    setLoadingMessages(true);
    try {
      const data = await getMessages(sessionId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      setLoadingSessions(true);
      try {
        const data = await getSessions();
        const ordered = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          : [];
        if (cancelled) return;
        setSessions(ordered);
        if (ordered.length) {
          setActiveSessionId(ordered[0].id);
          setLoadingMessages(true);
          try {
            const history = await getMessages(ordered[0].id);
            if (!cancelled) setMessages(Array.isArray(history) ? history : []);
          } catch (loadError) {
            if (!cancelled) setError(normalizeError(loadError));
          } finally {
            if (!cancelled) setLoadingMessages(false);
          }
        }
      } catch (loadError) {
        if (!cancelled) setError(normalizeError(loadError));
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    }
    initialize();
    return () => { cancelled = true; };
  }, []);

  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const session = await createSession("New conversation");
      setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
      setActiveSessionId(session.id);
      setMessages([]);
      setInput("");
      setSidebarOpen(false);
    } catch (createError) {
      setError(normalizeError(createError));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const sessionToDelete = sessions.find((item) => item.id === sessionId);
    if (!sessionToDelete) return;
    if (!window.confirm(`Delete "${sessionToDelete.title || "this conversation"}"?`)) return;

    setError("");
    try {
      await deleteSession(sessionId);
      const remaining = sessions.filter((item) => item.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
        if (remaining.length) await loadSession(remaining[0].id);
      }
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const messageText = input.trim();
    if (!messageText || sending) return;

    setError("");
    let sessionId = activeSessionId;

    // Automatically create a conversation if the user starts typing before creating one.
    if (!sessionId) {
      setCreating(true);
      try {
        const session = await createSession(messageText.slice(0, 48) || "New conversation");
        setSessions((current) => [session, ...current]);
        setActiveSessionId(session.id);
        sessionId = session.id;
      } catch (createError) {
        setError(normalizeError(createError));
        setCreating(false);
        return;
      } finally {
        setCreating(false);
      }
    }

    const optimisticUserMessage = {
      id: makeLocalId(),
      role: "USER",
      content: messageText,
      createdAt: new Date().toISOString(),
      provider: "GEMINI",
      pending: true
    };
    setMessages((current) => [...current, optimisticUserMessage]);
    setInput("");
    setSending(true);

    try {
      const result = await sendMessage({ sessionId, message: messageText });
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimisticUserMessage.id),
        result.userMessage,
        { ...result.assistantMessage, sources: result.sources || [] }
      ]);
      const updated = await refreshSessions();
      setSessions(updated);
    } catch (sendError) {
      setMessages((current) => current.filter((item) => item.id !== optimisticUserMessage.id));
      setInput(messageText);
      setError(normalizeError(sendError));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        loading={loadingSessions}
        creating={creating}
        open={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectSession={loadSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-panel">
        <ChatHeader
          title={activeSession?.title || "AI Chat"}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenDocuments={() => setDocumentsOpen(true)}
        />

        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        <section className="chat-stage">
          {loadingMessages ? (
            <div className="loading-state">
              <LoaderCircle className="spin" size={24} />
              <span>Loading conversation…</span>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onPrompt={(prompt) => setInput(prompt)} />
          ) : (
            <MessageList messages={messages} sending={sending} />
          )}
        </section>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          disabled={sending || creating || loadingMessages}
          sending={sending}
        />
        <footer className="app-footer">Gemini can make mistakes. Verify important information.</footer>
      </main>
      {documentsOpen && <DocumentsPanel onClose={() => setDocumentsOpen(false)} />}
    </div>
  );
}