# Ask Alex

Ask Alex is a deployable demo assistant that answers questions about Alex Muzyka's background, projects, and engineering decisions using a grounded corpus + tool calling.

## Reviewer Entry Points

- `SUBMISSION_NOTES.md` — requirement-to-implementation mapping for the test task.
- `ARCHITECTURE.md` — concise system boundaries and runtime flow.
- `README.md` (this file) — setup and runbook.

## Where Data Is Stored

Runtime data lives only in the repository:

- `src/content/corpus.json` — retrieval snapshot used by `search_candidate`
- `src/content/projects.json` — structured project catalog used by `get_project`

Build-time source files for ingestion also live only in the repository:

- `src/content/sources/candidate/bio.md`
- `src/content/sources/candidate/cv.md`
- `src/content/sources/candidate/projects-highlights.md`
- `src/content/sources/candidate/selected-stories.md`
- `src/content/sources/candidate/selected-posts.md`

No runtime or ingest dependency on Obsidian paths is allowed.

## What This Submission Shows

- Feature-first modular architecture for Next.js App Router.
- Grounded responses via `search_candidate` over a sanitized corpus snapshot.
- Structured project lookup via `get_project`.
- Optional external augmentation via `search_web`.
- Streaming chat and minimal PDF export.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)
- OpenRouter provider (`@openrouter/ai-sdk-provider`) for chat and embeddings
- Tavily web search (`@tavily/core`)

## Project Layout

Build-time ingestion scripts intentionally live outside `src/` because they are not part of the runtime application graph.

```txt
src/
  app/api/chat/route.ts
  app/api/export/route.ts
  features/*
  components/chat/*
  content/corpus.json
  content/projects.json
  content/sources/candidate/*.md
scripts/
  candidate-sources.ts
  ingest-corpus.ts
  redact-content.ts
  chunk-content.ts
```

## Environment Variables

Copy `.env.example` and configure:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (optional)
- `OPENROUTER_EMBEDDING_MODEL` (optional)
- `OPENROUTER_MAX_OUTPUT_TOKENS` (optional, default: `1200`)
- `TAVILY_API_KEY`

## Local Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Corpus Ingestion

```bash
pnpm ingest
```

This reads only local files from `src/content/sources/candidate/*.md`, redacts sensitive patterns, chunks deterministically, embeds chunks through OpenRouter, and writes `src/content/corpus.json`.

Curated boundary rules:
- `search_candidate` corpus is built only from whitelisted files in `src/content/sources/candidate`.
- Whitelist is explicit in `scripts/candidate-sources.ts` and required files are enforced.
- Extra markdown files outside the whitelist are ignored by ingest.
- `get_project` remains isolated and reads only `src/content/projects.json`.

## CI & GitHub Actions Deploy

Workflow file: `.github/workflows/vercel-deploy.yml`

It runs:
1. `pnpm lint`
2. `pnpm test`
3. `pnpm typecheck`
4. `pnpm build`
5. Deploy to Vercel:
   - Preview on pull requests to `main`
   - Production on pushes to `main`

### Required GitHub Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

You can get IDs from Vercel project settings and generate `VERCEL_TOKEN` from your Vercel account tokens page.

## Deploy

Deploy is automated via GitHub Actions + Vercel when secrets are configured.
