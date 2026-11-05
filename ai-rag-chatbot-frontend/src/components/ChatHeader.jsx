import { Menu, BookOpen } from "lucide-react";
import "./ChatHeader.css";
export default function ChatHeader({ title, onOpenSidebar, onOpenDocuments }) {
  return <header className="chat-header"><button className="mobile-menu-button" aria-label="Open conversations" onClick={onOpenSidebar}><Menu size={19}/></button><div className="chat-header-title"><span className="status-dot"/><div><h1>{title || "AI Chat"}</h1><p>Gemini-powered assistant with document retrieval</p></div></div><button className="knowledge-button" onClick={onOpenDocuments}><BookOpen size={16}/><span>Knowledge base</span></button></header>;
}
