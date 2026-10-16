
export interface Challenge {
  id: number | string;
  lang: string;
  difficulty: "easy" | "medium" | "hard";
  errorType: string;
  title: string;
  xp: number;
  description: string;
  lines: string[];
  bugLine: number;
  fixed: string;
  hint: string;
  expectedOutput: string;
}
