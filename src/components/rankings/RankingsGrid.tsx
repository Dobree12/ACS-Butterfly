import type { UserProfile } from "@/lib/types/user";

type Props = {
  users: UserProfile[];
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

export default function RankingsGrid({ users }: Props) {
  if (users.length === 0) {
    return <div className="card">Nu există jucători disponibili.</div>;
  }

  return (
    <div className="rankings-grid">
      {users.map((user) => {
        const initials = `${user.first_name?.[0] ?? ""}${
          user.last_name?.[0] ?? ""
        }`.toUpperCase();
        const levelClass =
          user.level === "elite"
            ? "player-card-level-elite"
            : user.level === "open"
            ? "player-card-level-open"
            : user.level === "avansati"
            ? "player-card-level-avansati"
            : "player-card-level-hobby";
        return (
          <div className="player-card" key={user.id}>
            <div className="player-card-avatar">{initials || "??"}</div>
            <div className="player-card-name">
              {user.first_name} {user.last_name}
            </div>
            <span className={`player-card-level ${levelClass}`}>
              {levelLabel(user.level)}
            </span>
            <div className="player-card-mp">{user.mp_points ?? 0}</div>
            <div className="mp-label">MP Points</div>
          </div>
        );
      })}
    </div>
  );
}
