# AI Workflow

## Working Model

This project was built as a demo-first architecture exercise:

1. Lock scope to must-have reviewer signals.
2. Build clean module boundaries around external dependencies.
3. Keep runtime path minimal and deployable.
4. Push non-critical depth into explicit `nice-to-have` backlog.

## What AI Was Used For

- Accelerating module scaffolding and route wiring.
- Generating first-pass component structure and prompt drafts.
- Producing baseline ingestion and normalization helpers.

## What Was Explicitly Human-Directed

- Final architecture shape and anti-overengineering constraints.
- Contract-level decisions (tool envelope, adapter seams, feature boundaries).
- Scope enforcement (keeping PDF minimal, keeping web search secondary).

## Decision Logs

### Decision 1: Feature-first over layered theater

- AI proposed broader layered splits.
- Final decision: feature-first modules (`chat/retrieval/projects/web-search/export`) to reduce ceremony and improve reviewer readability.

### Decision 2: Minimal PDF in first scope

- Initial drafts pushed PDF to later phase.
- Final decision: include a thin-slice PDF export now, because it is part of expected submission signal.

### Decision 3: Snapshot corpus committed to repo

- Runtime reading from local Obsidian paths was rejected.
- Final decision: sanitized snapshot in `src/content/corpus.json` for reproducibility and public deploy safety.

## Iteration Pattern

- Run small vertical slices (`feature module -> route -> UI touchpoint`).
- Keep every dependency behind a named module boundary.
- Validate with lint/build/smoke checks before expanding scope.
