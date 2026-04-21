# Ask Alex — Local Data Contract

- Runtime читает только snapshot-файлы из репозитория:
  - `src/content/corpus.json`
  - `src/content/projects.json`
- Build-time ingest читает только локальные markdown-источники в репозитории:
  - `src/content/sources/*.md`
- Обращения к Obsidian или любым абсолютным локальным путям запрещены.
