
export interface CommunityUpload {
  id?: string;
  title: string;
  language: string;
  difficulty: "easy" | "medium" | "hard";
  code: string;
  hint: string;
  lines: string[];
  description: string;
  xp: number;
  createdAt?: unknown;
  [key: string]: unknown;
}
