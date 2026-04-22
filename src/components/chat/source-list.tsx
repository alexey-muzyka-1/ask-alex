import type { CandidateHit } from "@/src/features/retrieval/retrieval.types";

type SourceListProps = {
  hits: CandidateHit[];
};

export function SourceList({ hits }: SourceListProps) {
  if (hits.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg bg-bg-100/85 p-2">
      <p className="text-xs font-semibold text-text-300">Источники</p>
      <ul className="mt-1 space-y-1 text-xs text-text-400">
        {hits.map((hit) => (
          <li key={hit.chunkId}>
            <span className="font-medium text-text-200">{hit.source}</span>
            {hit.sourceType ? (
              <span className="ml-1 rounded bg-bg-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-300">
                {hit.sourceType}
              </span>
            ) : null}
            <span className="ml-1 tabular-nums">оценка {hit.score.toFixed(3)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
