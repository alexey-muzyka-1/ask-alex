import type { CandidateHit } from "@/src/features/retrieval/retrieval.types";

type SourceListProps = {
  hits: CandidateHit[];
};

export function SourceList({ hits }: SourceListProps) {
  if (hits.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/40 p-2">
      <p className="text-xs font-medium text-muted-foreground">Sources</p>
      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
        {hits.map((hit) => (
          <li key={hit.chunkId} className="line-clamp-2">
            <span className="font-medium text-foreground">{hit.source}</span>
            <span className="ml-1">score {hit.score.toFixed(3)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
