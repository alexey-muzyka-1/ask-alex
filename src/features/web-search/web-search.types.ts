export type WebSearchResultItem = {
  title: string;
  url: string;
  snippet: string;
  score?: number;
};

export type WebSearchOutput = {
  results: WebSearchResultItem[];
};
