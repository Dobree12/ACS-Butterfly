"use client";

import RankingsGrid from "@/components/rankings/RankingsGrid";
import { useUsers } from "@/lib/hooks/useUsers";

export default function RankingsPage() {
  const { users } = useUsers();
  return (
    <main className="main-content">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Clasament General</h2>
          <div className="tabs">
            <button className="tab active">Toate</button>
            <button className="tab">Elite</button>
            <button className="tab">Open</button>
            <button className="tab">Avansați</button>
            <button className="tab">Hobby</button>
          </div>
        </div>
        <RankingsGrid users={users} />
      </div>
    </main>
  );
}
