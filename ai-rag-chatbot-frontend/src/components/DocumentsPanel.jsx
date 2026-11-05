import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, LoaderCircle, RefreshCw, X } from "lucide-react";
import { deleteDocument, getDocuments, uploadDocument } from "../api.js";
import "./DocumentsPanel.css";

export default function DocumentsPanel({ onClose }) {
  const [documents, setDocuments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const refresh = async () => { try { setDocuments(await getDocuments()); setError(""); } catch (e) { setError(e.message); } };
  useEffect(() => { refresh(); }, []);
  const onFiles = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true); setError("");
    try { await uploadDocument(file); await refresh(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const remove = async (doc) => {
    if (!window.confirm(`Remove ${doc.fileName} and its indexed chunks?`)) return;
    setBusy(true); setError("");
    try { await deleteDocument(doc.id); await refresh(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  return <aside className="documents-panel" aria-label="Knowledge documents">
    <div className="documents-heading"><div><span className="documents-kicker">KNOWLEDGE BASE</span><h2>Documents</h2></div><button className="icon-button" onClick={onClose} aria-label="Close documents"><X size={18}/></button></div>
    <p className="documents-description">Upload PDFs or text files. Gemini will answer questions using relevant passages from these documents.</p>
    <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv" hidden onChange={onFiles}/>
    <button className="upload-document-button" onClick={() => fileRef.current?.click()} disabled={busy}><Upload size={17}/>{busy ? "Processing…" : "Upload a document"}</button>
    <button className="refresh-documents-button" onClick={refresh} disabled={busy}><RefreshCw size={14}/> Refresh list</button>
    {error && <div className="documents-error">{error}</div>}
    <div className="document-list">{documents.length === 0 ? <div className="documents-empty"><FileText size={25}/><strong>No documents yet</strong><span>Upload a PDF or text file to start building your knowledge base.</span></div> : documents.map(doc => <div className="document-item" key={doc.id}><div className="document-icon"><FileText size={18}/></div><div className="document-meta"><strong title={doc.fileName}>{doc.fileName}</strong><span>{doc.chunkCount ?? 0} chunks · {doc.status || "Indexed"}</span></div><button className="icon-button danger" title="Delete document" onClick={() => remove(doc)} disabled={busy}><Trash2 size={16}/></button></div>)}</div>
    {busy && <div className="documents-processing"><LoaderCircle size={15} className="spin"/> Processing document and generating embeddings…</div>}
    <div className="documents-note">Supported: PDF, TXT, Markdown, CSV · Max size configured by backend</div>
  </aside>;
}
