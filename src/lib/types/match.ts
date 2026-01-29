export type MatchPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  level?: string | null;
  mp_points?: number | null;
};

export type Match = {
  id: string;
  match_date: string | null;
  player1_score: number | null;
  player2_score: number | null;
  winner_id: string | null;
  player1: MatchPlayer;
  player2: MatchPlayer;
  tournament?: { name: string } | null;
};
