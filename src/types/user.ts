
export interface AppUser {
  uid: string;
  name: string;
  email: string | null;
  avatar: string;
  role: string;
  xp: number;
  streak: number;
  solved: number;
  lastSolvedDate: string | null;
  solvedChallenges: (string | number)[];
  createdAt?: unknown;
  [key: string]: unknown;
}
