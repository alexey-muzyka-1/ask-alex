const REDACTION_PATTERNS: Array<[RegExp, string]> = [
  [/sk-[a-zA-Z0-9_-]{12,}/g, "[REDACTED_API_KEY]"],
  [/tvly-[a-zA-Z0-9_-]{8,}/g, "[REDACTED_API_KEY]"],
  [/https?:\/\/[^\s]*\.(internal|local|lan)[^\s]*/gi, "[REDACTED_INTERNAL_URL]"],
  [/\/Users\/[^\s`"']+/g, "[REDACTED_LOCAL_PATH]"],
  [/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, "[REDACTED_CARD]"],
  [/\b\+\d{1,3}[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}\b/g, "[REDACTED_PHONE]"],
];

export function redactContent(input: string): string {
  let output = input;

  for (const [pattern, replacement] of REDACTION_PATTERNS) {
    output = output.replace(pattern, replacement);
  }

  return output;
}
