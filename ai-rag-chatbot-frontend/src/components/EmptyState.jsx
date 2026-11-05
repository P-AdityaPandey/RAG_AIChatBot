import { Code2, Lightbulb, BookOpen, PenLine, Sparkles } from "lucide-react";
import "./EmptyState.css";

const prompts = [
  { icon: Code2, title: "Explain a concept", text: "Explain dependency injection in Spring Boot with a simple example." },
  { icon: Lightbulb, title: "Brainstorm ideas", text: "Give me five practical project ideas for a Java full-stack developer." },
  { icon: BookOpen, title: "Help me learn", text: "Create a 7-day plan to practise Java collections for interviews." },
  { icon: PenLine, title: "Improve my writing", text: "Help me write a concise professional introduction for an interview." }
];

export default function EmptyState({ onPrompt }) {
  return (
    <div className="empty-state">
      <div className="empty-logo"><Sparkles size={25} /></div>
      <p className="eyebrow">YOUR AI ASSISTANT</p>
      <h2>What would you like to explore?</h2>
      <p className="empty-description">Ask a question, work through an idea, or learn something new with Gemini.</p>
      <div className="prompt-grid">
        {prompts.map(({ icon: Icon, title, text }) => (
          <button className="prompt-card" key={title} onClick={() => onPrompt(text)}>
            <span className="prompt-icon"><Icon size={17} /></span>
            <span className="prompt-copy"><strong>{title}</strong><span>{text}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}