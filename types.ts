
export interface DetectedLanguageInfo {
  line: string;
  languages: string[];
}

export interface ForeignLanguageReport {
  [lineNumber: string]: DetectedLanguageInfo;
}

export interface CleanedFileItem {
  id: string;
  originalName: string;
  outputName: string;
  originalContent: string;
  cleanedContent: string;
  summary: ChangeSummary;
  foreignReport: ForeignLanguageReport;
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
  exclamationAndQuestionsRemoved: number;
  dialoguesSplit: number;
  englishLinesRemoved: number;
  foreignLinesCount: number;
  formatFixes: number;
}

export interface CleanerOptions {
  removeBackslashes: boolean;
  fixTimestamps: boolean;
  normalizeHtml: boolean;
  stripBrackets: boolean;
  stripParens: boolean;
  removeSpeakerLabels: boolean;
  removeUntranslatedEnglish: boolean;
  removeMyanmarSpecialChars: boolean;
  removeExclamationAndQuestion: boolean;
  splitDialogues: boolean;
  removeEmptyHyphens: boolean;
}

export const DEFAULT_CLEANER_OPTIONS: CleanerOptions = {
  removeBackslashes: true,
  fixTimestamps: true,
  normalizeHtml: true,
  stripBrackets: true,
  stripParens: true,
  removeSpeakerLabels: true,
  removeUntranslatedEnglish: true,
  removeMyanmarSpecialChars: true,
  removeExclamationAndQuestion: true,
  splitDialogues: true,
  removeEmptyHyphens: true,
};

// Types for Income Tracker
export interface IncomeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO timestamp
  lines: number;
  rate: number;
  amount: number;
  note?: string;
}

export interface MonthData {
  total: number;
  entries: IncomeEntry[];
}

export interface IncomeData {
  [month: string]: MonthData; // key is YYYY-MM
}