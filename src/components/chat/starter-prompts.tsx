const PROMPTS = [
  "What did Alex build at Viralmaxing?",
  "What happened in the casino incident recovery case?",
  "Покажи ключевые проекты Алекса и цикл поставки",
  "Какие решения он принимал как tech lead?",
];

type StarterPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function StarterPrompts({ onSelect, disabled }: StarterPromptsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
