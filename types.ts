
export interface DetectedLanguageInfo {
  line: string;
  languages: string[];
}

export interface ForeignLanguageReport {
  // FIX: Changed index signature from `number` to `string`. This allows for correct type inference with `Object.entries` in consuming components.
  [lineNumber: string]: DetectedLanguageInfo;
}

export interface ChangeSummary {
  backslashesRemoved: number;
  timestampsFixed: number;
  htmlTagsFixed: number;
  bracketsRemoved: number;
  parensRemoved: number;
  speakerLabelsRemoved: number;
  hyphensRemoved: number;
  myanmarCharsRemoved: number;
  dialoguesSplit: number;
  foreignLinesCount: number;
  formatFixes: number;
}

// New types for Income Tracker
export interface IncomeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO timestamp for exact time
  lines: number;
  rate: number;
  amount: number;
}

export interface MonthData {
  total: number;
  entries: IncomeEntry[];
}

export interface IncomeData {
  [month: string]: MonthData; // key is YYYY-MM
}