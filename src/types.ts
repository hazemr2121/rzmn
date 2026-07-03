export type Difficulty = "easy" | "medium" | "hard";
export type Screen = "splash" | "setup" | "pick" | "board" | "end" | "history";

export interface Question {
  q: string;
  a: string;
  difficulty: Difficulty;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  grad: string;
  imageUrl?: string;
  source: "local" | "api" | "opentdb" | "islamic" | "ai";
  apiCategory?: string;
  apiCategoryId?: number;
  questions?: Question[];
}

export interface SelectedCategory {
  id: string;
  source: "local" | "api" | "opentdb" | "islamic" | "ai";
  name: string;
  apiCategory?: string;
  apiCategoryId?: number;
}

export interface GameConfig {
  team1: string;
  team2: string;
  sharedCats: SelectedCategory[];
}

export interface Scores {
  team1: number;
  team2: number;
}

export interface PowerUps {
  team1: { double: boolean; twoAnswers: boolean };
  team2: { double: boolean; twoAnswers: boolean };
}

export interface ActiveSession {
  _id: string;
  team1: string;
  team2: string;
  scores: Scores;
}
