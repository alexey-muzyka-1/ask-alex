const PROMPTS = [
  "Что Алекс построил в Viralmaxing?",
  "Как Алекс восстановил систему после casino-инцидента?",
  "Покажи ключевые проекты Алекса и цикл поставки",
  "Какие решения он принимал как техлид?",
];

type StarterPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function StarterPrompts({ onSelect, disabled }: StarterPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="inline-flex min-h-10 items-center rounded-full border border-bg-300 bg-bg-100 px-3 text-xs font-medium text-text-300 transition hover:border-accent/40 hover:bg-accent/10 hover:text-text-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
