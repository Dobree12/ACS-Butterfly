"use client";

import { useMemo } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import LatestTournamentCard from "@/components/tournaments/LatestTournamentCard";
import RecentMatchesCard from "@/components/matches/RecentMatchesCard";
import EquipmentModal from "@/components/profile/EquipmentModal";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEquipmentSetup } from "@/lib/hooks/useEquipmentSetup";
import { useMatches } from "@/lib/hooks/useMatches";
import { useTournaments } from "@/lib/hooks/useTournaments";
import { useTournamentParticipants } from "@/lib/hooks/useTournamentParticipants";
import { useUserStats } from "@/lib/hooks/useUserStats";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { stats } = useUserStats(user?.id);
  const { setup } = useEquipmentSetup(user?.id);
  const { matches: recentMatches } = useMatches({ limit: 3 });
  const { tournaments } = useTournaments();
  const latestTournament = useMemo(
    () => (tournaments.length > 0 ? tournaments[0] : null),
    [tournaments]
  );
  const { participants } = useTournamentParticipants(latestTournament?.id);

  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>ACS BUTTERFLY</h1>
          <p className="subtitle">Club de tenis de masă · Cluj-Napoca</p>
        </div>
      </section>

      <div className="main-content">
        <div className="container">
          <div className="dashboard">
            <DashboardSidebar
              profile={profile}
              stats={stats}
              equipment={setup}
            />
            <div className="content-area">
              <LatestTournamentCard
                tournament={latestTournament}
                participants={participants}
              />
              <RecentMatchesCard matches={recentMatches} />
            </div>
          </div>
        </div>
      </div>

      <EquipmentModal />
    </main>
  );
}
