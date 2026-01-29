"use client";

import HistoryMatchesCard from "@/components/matches/HistoryMatchesCard";
import { useMatches } from "@/lib/hooks/useMatches";

export default function HistoryPage() {
  const { matches } = useMatches();
  return (
    <main className="main-content">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Istoric Complet</h2>
        </div>
        <HistoryMatchesCard matches={matches} />
      </div>
    </main>
  );
}
