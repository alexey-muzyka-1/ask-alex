export type CandidateSourceType =
  | "bio"
  | "cv"
  | "project-summary"
  | "story"
  | "post";

export type CandidateSourceSpec = {
  fileName: string;
  sourceType: CandidateSourceType;
  required: boolean;
};

export const CANDIDATE_SOURCE_SPECS: ReadonlyArray<CandidateSourceSpec> = [
  { fileName: "bio.md", sourceType: "bio", required: true },
  { fileName: "cv.md", sourceType: "cv", required: true },
  {
    fileName: "projects-highlights.md",
    sourceType: "project-summary",
    required: true,
  },
  { fileName: "selected-stories.md", sourceType: "story", required: true },
  { fileName: "selected-posts.md", sourceType: "post", required: true },
];

export function selectWhitelistedCandidateSources(
  discoveredFiles: string[],
): CandidateSourceSpec[] {
  const normalizedDiscovered = new Set(
    discoveredFiles.map((fileName) => fileName.toLowerCase()),
  );

  return CANDIDATE_SOURCE_SPECS.filter((spec) =>
    normalizedDiscovered.has(spec.fileName.toLowerCase()),
  );
}

export function assertRequiredCandidateSources(
  discoveredFiles: string[],
): void {
  const normalizedDiscovered = new Set(
    discoveredFiles.map((fileName) => fileName.toLowerCase()),
  );

  const missing = CANDIDATE_SOURCE_SPECS.filter(
    (spec) =>
      spec.required && !normalizedDiscovered.has(spec.fileName.toLowerCase()),
  ).map((spec) => spec.fileName);

  if (missing.length > 0) {
    throw new Error(
      `Missing required candidate source files: ${missing.join(", ")}`,
    );
  }
}

export function buildCandidateTags(sourceType: CandidateSourceType): string[] {
  return ["candidate", sourceType];
}
