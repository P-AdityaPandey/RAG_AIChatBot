# Java 21 RAG Chatbot Backend — Spring Boot + Spring AI + Google Gemini

## Included
- Java 21, Spring Boot 3.5.7, Spring AI 1.1.0
- Google Gemini chat model (`gemini-2.5-flash` default)
- Google GenAI text embeddings (`gemini-embedding-001` default)
- PostgreSQL + pgvector vector store
- PostgreSQL persistence for sessions, messages, and uploaded-document metadata
- PDF/TXT/Markdown/CSV ingestion, chunking, vector indexing, similarity retrieval, source references
- Flyway schema migrations, Docker Compose for PostgreSQL, CORS for Vite


## Prerequisites
- JDK 21 and Maven 3.9+
- Docker Desktop
- Google AI Studio API key with Gemini API enabled

## Run locally (Windows PowerShell)
1. Copy `.env.example` to `.env`, then fill in a valid Gemini API key and a strong DB password. Do not commit `.env`.
2. Start PostgreSQL + pgvector: `docker compose up -d postgres`.
3. Set environment variables in the terminal used to start Maven (PowerShell example):
```powershell
$env:GEMINI_API_KEY="YOUR_ROTATED_KEY"
$env:DB_USERNAME="raguser"
$env:DB_PASSWORD="YOUR_DB_PASSWORD"
$env:DB_URL="jdbc:postgresql://localhost:5432/rag_chatbot"
mvn spring-boot:run
```
The PostgreSQL password used in `docker-compose.yml` must match `DB_PASSWORD`. For convenience, you can set `DB_PASSWORD` in your terminal before `docker compose up -d postgres`.
4. Check `http://localhost:8088/api/health`.
5. Run the frontend from its separate ZIP at `http://localhost:5178`.

## API
- `GET /api/health`
- `GET /api/sessions` / `POST /api/sessions` / `DELETE /api/sessions/{id}`
- `GET /api/sessions/{id}/messages`
- `POST /api/chat` JSON `{ "sessionId": "...", "message": "..." }`
- `GET /api/documents`
- `POST /api/documents/upload` multipart form field `file`
- `DELETE /api/documents/{id}`

`POST /api/chat` returns `userMessage`, `assistantMessage`, and `sources` (matched source filenames, document IDs, chunk indexes, excerpts).

## RAG behavior and current MVP boundaries
- Text-based PDFs only. Scanned/image-only PDFs require OCR and are not supported in this MVP.
- Files up to 15 MB.
- Text chunks are approximately 1,200 characters with 180-character overlap; top five similarity results are passed to Gemini.
- The current implementation stores the full prompt with retrieved context in chat history as a normal assistant response; source references are returned separately.
- This is a local development baseline, not production-hardened: add authentication/authorization, rate limits, antivirus/file validation, async ingestion, retries, observability, data retention, and robust transactional cleanup before production.
- If your Google account/model access does not include `gemini-2.5-flash` or `gemini-embedding-001`, configure supported model IDs through environment variables.
