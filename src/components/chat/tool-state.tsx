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
    return <p className="text-xs text-text-400">Выполняется {part.type}…</p>;
  }

  if (state === "input-available") {
    return <p className="text-xs text-text-400">Подготовлен ввод для {part.type}.</p>;
  }

  if (state === "output-error") {
    return (
      <p className="text-xs text-destructive">
        Ошибка {part.type}: {part.errorText ?? "Неизвестная ошибка инструмента"}
      </p>
    );
  }

  if (state === "output-available") {
    return <p className="text-xs text-text-400">{part.type} выполнен.</p>;
  }

  return <p className="text-xs text-text-400">{part.type}, состояние: {state}</p>;
}
