type ToolStateProps = {
  part: {
    state?: string;
    errorText?: string;
  };
};

export function ToolState({ part }: ToolStateProps) {
  if (part.state === "input-streaming") {
    return (
      <p className="text-xs text-text-400">
        Думаю, проверяю источники…
      </p>
    );
  }

  if (part.state === "output-error") {
    return (
      <p className="text-xs text-destructive">
        Не удалось получить дополнительные данные.
        {part.errorText ? ` ${part.errorText}` : ""}
      </p>
    );
  }

  return null;
}
