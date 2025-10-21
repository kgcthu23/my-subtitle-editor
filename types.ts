
export interface DetectedLanguageInfo {
  line: string;
  languages: string[];
}

export interface ForeignLanguageReport {
  [lineNumber: number]: DetectedLanguageInfo;
}

export interface ChangeSummary {
  backslashesRemoved: number;
  timestampsFixed: number;
  htmlTagsFixed: number;
  bracketsRemoved: number;
  parensRemoved: number;
  hyphensRemoved: number;
  myanmarCharsRemoved: number;
  dialoguesSplit: number;
  foreignLinesCount: number;
}
