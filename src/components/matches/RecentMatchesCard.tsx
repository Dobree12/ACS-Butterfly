import type { Match } from "@/lib/types/match";

type Props = {
  matches: Match[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "Data necunoscută";
  return new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function RecentMatchesCard({ matches }: Props) {
  return (
    <div className="card">
      <div className="card-title">
        <span>Meciuri Recente</span>
      </div>
      {matches.length === 0 ? (
        <div style={{ color: "var(--text-dim)" }}>
          Nu există meciuri înregistrate.
        </div>
      ) : (
        <div className="match-list">
          {matches.map((match) => {
            const scoreLabel =
              match.player1_score !== null && match.player2_score !== null
                ? `${match.player1_score}-${match.player2_score}`
                : "—";
            const player1Winner = match.winner_id === match.player1.id;
            const player2Winner = match.winner_id === match.player2.id;
            return (
              <div className="match-item" key={match.id}>
                <div className="match-players">
                  <div
                    className={`match-player ${player1Winner ? "winner" : ""}`}
                  >
                    {match.player1.first_name} {match.player1.last_name}
                  </div>
                  <div
                    className={`match-player ${player2Winner ? "winner" : ""}`}
                  >
                    {match.player2.first_name} {match.player2.last_name}
                  </div>
                </div>
                <div className="match-score">
                  {scoreLabel}
                  <div className="match-sets">
                    {scoreLabel === "—" ? "Scor indisponibil" : "Scor final"}
                  </div>
                </div>
                <div className="match-date">{formatDate(match.match_date)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
