export type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type TournamentFormat =
  | "round_robin"
  | "swiss"
  | "single_elimination"
  | "double_elimination";

export type Tournament = {
  id: string;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  format?: TournamentFormat;
  max_players: number | null;
  best_of: number | null;
};

export type TournamentParticipant = {
  id: string;
  user_id: string;
  total_wins: number | null;
  total_losses: number | null;
  user: {
    first_name: string;
    last_name: string;
    level: string | null;
    mp_points: number | null;
  };
};

export type NewTournament = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  format: TournamentFormat;
  max_players: string;
  best_of: string;
};
