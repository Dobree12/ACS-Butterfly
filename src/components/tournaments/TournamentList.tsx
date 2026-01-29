import type { Tournament } from "@/lib/types/tournament";
import type { UserProfile } from "@/lib/types/user";
import TournamentCard from "@/components/tournaments/TournamentCard";

type Props = {
  tournaments: Tournament[];
  currentUserId?: string | null;
  canManageTournaments?: boolean;
  users?: UserProfile[];
  onTournamentUpdated?: (tournament: Tournament) => void;
};

export default function TournamentList({
  tournaments,
  currentUserId,
  canManageTournaments = false,
  users = [],
  onTournamentUpdated,
}: Props) {
  return (
    <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
      {tournaments.map((t) => (
        <TournamentCard
          key={t.id}
          tournament={t}
          currentUserId={currentUserId}
          canManageTournaments={canManageTournaments}
          users={users}
          onTournamentUpdated={onTournamentUpdated}
        />
      ))}
    </div>
  );
}
