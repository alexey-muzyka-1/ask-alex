# Submission Notes — Ask Alex

## Goal of this submission
A demo assistant that can present a candidate profile when full private code/context cannot be shared.

## Requirement Coverage

### 1) Chat bot about the candidate on any platform
Implemented as a deployable Next.js web app with server routes and streaming chat.
- Chat endpoint: `src/app/api/chat/route.ts`
- UI shell: `src/components/chat/chat-shell.tsx`

### 2) Tool calling + RAG + internet search
Implemented with explicit tool registry and grounded retrieval.
- Tool registry: `src/features/chat/tool-registry.ts`
- RAG tool: `search_candidate` over curated candidate corpus (`src/content/corpus.json`)
- Structured project lookup: `get_project` over `src/content/projects.json`
- Web search tool: `search_web` via Tavily adapter

### 3) PDF export
Implemented as server API + PDF generator.
- Export endpoint: `src/app/api/export/route.ts`
- PDF generation: `src/features/export/export-chat-pdf.ts`

### 4) Ready to show source code
Repository is fully reviewable with modular boundaries and documented setup.
- Setup and run instructions: `README.md`
- Architecture snapshot: `ARCHITECTURE.md`

### 5) Detailed AI tooling and configuration
Current AI stack and configuration are documented.
- Chat/model provider: OpenRouter (`@openrouter/ai-sdk-provider`)
- Tool runtime: Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)
- Web search: Tavily (`@tavily/core`)
- Embeddings: OpenRouter embeddings model (`OPENROUTER_EMBEDDING_MODEL`)
- Required env vars: listed in `README.md`

### 6) Development flow with AI assistant
Flow used in this submission:
1. Define requirement-to-feature mapping.
2. Build modular tools (`search_candidate`, `get_project`, `search_web`).
3. Build curated candidate corpus and deterministic ingest pipeline.
4. Add source attribution in retrieval hits (`source`, optional `sourceType`).
5. Add export flow and UI integration.
6. Validate with `lint`, `test`, `typecheck`, `build`.

## Curated Candidate Corpus Boundary
`search_candidate` indexes only whitelisted candidate sources:
- `src/content/sources/candidate/bio.md`
- `src/content/sources/candidate/cv.md`
- `src/content/sources/candidate/projects-highlights.md`
- `src/content/sources/candidate/selected-stories.md`
- `src/content/sources/candidate/selected-posts.md`

Whitelist and required-file enforcement live in:
- `scripts/candidate-sources.ts`

Ingest pipeline:
- `scripts/ingest-corpus.ts`

## Verification status
The project passes:
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

## Reviewer quick start
1. Configure `.env` variables from `README.md`.
2. Run `pnpm install`.
3. Run `pnpm dev`.
4. Optionally refresh corpus: `pnpm ingest`.
5. Ask background/project questions and test PDF export.
