type ToolStateProps = {
  part: {
    type: string;
    state?: string;
    errorText?: string;
  };
};

export function ToolState({ part }: ToolStateProps) {
  const state = part.state ?? "unknown";

  if (state === "input-streaming") {
    return <p className="text-xs text-muted-foreground">Running {part.type}...</p>;
  }

  if (state === "input-available") {
    return <p className="text-xs text-muted-foreground">Prepared {part.type} input.</p>;
  }

  if (state === "output-error") {
    return (
      <p className="text-xs text-destructive">
        {part.type} failed: {part.errorText ?? "Unknown tool error"}
      </p>
    );
  }

  if (state === "output-available") {
    return <p className="text-xs text-muted-foreground">{part.type} completed.</p>;
  }

  return <p className="text-xs text-muted-foreground">{part.type} state: {state}</p>;
}
