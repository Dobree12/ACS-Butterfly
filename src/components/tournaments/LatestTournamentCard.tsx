import type { Tournament, TournamentParticipant } from "@/lib/types/tournament";
import { formatRange, statusLabel } from "@/lib/utils/tournament";

type Props = {
  tournament: Tournament | null;
  participants: TournamentParticipant[];
};

const levelLabel = (level?: string | null) => {
  switch (level) {
    case "avansati":
      return "Avansați";
    case "open":
      return "Open";
    case "elite":
      return "Elite";
    default:
      return "Hobby";
  }
};

export default function LatestTournamentCard({
  tournament,
  participants,
}: Props) {
  return (
    <div className="card">
      <div className="tournament-header">
        <div className="tournament-info">
          <h3>{tournament ? tournament.name : "Niciun turneu activ"}</h3>
          {tournament ? (
            <div className="tournament-date">
              {formatRange(tournament.start_date, tournament.end_date)}
              {tournament.max_players
                ? ` · ${tournament.max_players} jucători`
                : ""}
              {tournament.best_of ? ` · Best of ${tournament.best_of}` : ""}
            </div>
          ) : null}
        </div>
        {tournament ? (
          <span
            className={`tournament-status ${
              tournament.status === "upcoming" ? "upcoming" : ""
            }`}
          >
            {statusLabel(tournament.status)}
          </span>
        ) : null}
      </div>
      <div className="leaderboard">
        {!tournament ? (
          <div style={{ color: "var(--text-dim)" }}>
            Nu există clasament disponibil.
          </div>
        ) : participants.length === 0 ? (
          <div style={{ color: "var(--text-dim)" }}>
            Nu există participanți încă.
          </div>
        ) : (
          participants.map((participant, index) => {
            const rankClass =
              index === 0
                ? "gold"
                : index === 1
                ? "silver"
                : index === 2
                ? "bronze"
                : "";
            const initials = `${participant.user.first_name?.[0] ?? ""}${
              participant.user.last_name?.[0] ?? ""
            }`.toUpperCase();
            return (
              <div className="leaderboard-item" key={participant.id}>
                <div className={`rank ${rankClass}`}>{index + 1}</div>
                <div className="player-avatar">{initials || "??"}</div>
                <div className="player-info">
                  <div className="player-name">
                    {participant.user.first_name} {participant.user.last_name}
                  </div>
                  <div className="player-level">
                    {levelLabel(participant.user.level)}
                  </div>
                </div>
                <div className="player-points">
                  {(participant.total_wins ?? 0)}-
                  {(participant.total_losses ?? 0)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
