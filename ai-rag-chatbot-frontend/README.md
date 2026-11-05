# RAG Chatbot Frontend (React + Vite)

Component-based React frontend for the Java 21 / Spring Boot / Spring AI backend. Includes conversation sidebar, chat history, document upload/list/delete panel, and Gemini-backed chat.

## Requirements
- Node.js 22 LTS recommended
- Backend running at `http://localhost:8080`

## Run
```bash
npm install
copy .env.example .env.local
npm run dev
```
Open `http://localhost:5173`. Set `VITE_API_BASE_URL=http://localhost:8080/api` in `.env.local` if needed.

## UI behavior
- Existing chat/session component structure is retained.
- Use **Knowledge base** to upload `.pdf`, `.txt`, `.md`, or `.csv` documents.
- Upload requests are processed synchronously and may take a while while embeddings are generated.
- Chat answers can include retrieved source metadata from the backend.

## Important
This frontend expects the RAG backend API included in the separate backend ZIP. It is not intended to run against the old MySQL-only backend without the new document endpoints.
