"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import TournamentCreateForm from "@/components/tournaments/TournamentCreateForm";
import TournamentList from "@/components/tournaments/TournamentList";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTournaments } from "@/lib/hooks/useTournaments";
import { useUsers } from "@/lib/hooks/useUsers";
import type { NewTournament, Tournament } from "@/lib/types/tournament";
import { supabase } from "@/lib/supabase/client";

type CreateState = {
  status: "idle" | "saving" | "success" | "error";
  message?: string;
};

const initialTournament: NewTournament = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "upcoming",
  format: "round_robin",
  max_players: "16",
  best_of: "3",
};

export default function TournamentsPage() {
  const { tournaments, setTournaments } = useTournaments();
  const { user, role } = useAuth();
  const { users } = useUsers();
  const canManageTournaments = role === "organizer";

  const [newTournament, setNewTournament] =
    useState<NewTournament>(initialTournament);
  const [createState, setCreateState] = useState<CreateState>({
    status: "idle",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleTournamentUpdated = (updated: Tournament) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
  };

  const sortedTournaments = useMemo(
    () =>
      [...tournaments].sort(
        (a, b) =>
          new Date(b.start_date).getTime() -
          new Date(a.start_date).getTime()
      ),
    [tournaments]
  );

  const latestUpcoming = useMemo(() => {
    const upcoming = tournaments.filter(
      (t) =>
        t.status === "upcoming" ||
        new Date(t.start_date).getTime() > Date.now()
    );
    return (
      [...upcoming].sort(
        (a, b) =>
          new Date(b.start_date).getTime() -
          new Date(a.start_date).getTime()
      )[0] ?? null
    );
  }, [tournaments]);

  const handleCreateTournament = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateState({ status: "saving" });

    if (!newTournament.name.trim()) {
      setCreateState({
        status: "error",
        message: "Completeaza numele turneului.",
      });
      return;
    }

    if (!newTournament.start_date || !newTournament.end_date) {
      setCreateState({
        status: "error",
        message: "Completeaza data de start si data de sfarsit.",
      });
      return;
    }

    if (!user) {
      setCreateState({
        status: "error",
        message: "Trebuie sa fii autentificat pentru a crea turneu.",
      });
      return;
    }

    if (!canManageTournaments) {
      setCreateState({
        status: "error",
        message: "Doar organizatorii pot crea turnee.",
      });
      return;
    }

    const maxPlayersValue = newTournament.max_players.trim();
    const bestOfValue = newTournament.best_of.trim();
    const maxPlayers = maxPlayersValue ? Number(maxPlayersValue) : null;
    const bestOf = bestOfValue ? Number(bestOfValue) : null;

    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        name: newTournament.name.trim(),
        description: newTournament.description.trim() || null,
        start_date: newTournament.start_date,
        end_date: newTournament.end_date,
        status: newTournament.status,
        format: newTournament.format,
        max_players: Number.isFinite(maxPlayers) ? maxPlayers : null,
        best_of: Number.isFinite(bestOf) ? bestOf : null,
        created_by: user.id,
      })
      .select(
        "id,name,description,format,start_date,end_date,status,max_players,best_of"
      );

    if (error) {
      setCreateState({ status: "error", message: error.message });
      return;
    }

    const created = data?.[0];
    if (created) {
      setTournaments((prev) => [...prev, created]);
    }

    setCreateState({ status: "success", message: "Turneu creat." });
    setNewTournament(initialTournament);
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Turnee</h2>
          <div className="tabs">
            <button className="tab active">Curente</button>
            <button className="tab">Viitoare</button>
            <button className="tab">Finalizate</button>
          </div>
        </div>

        {canManageTournaments ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">
              <span>Administrare turnee</span>
            </div>
            <button
              type="button"
              className="save-btn"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Ascunde formular" : "Creeaza turneu"}
            </button>
          </div>
        ) : null}

        {canManageTournaments && showCreateForm ? (
          <TournamentCreateForm
            value={newTournament}
            onChange={setNewTournament}
            onSubmit={handleCreateTournament}
            state={createState}
          />
        ) : null}

        {canManageTournaments && latestUpcoming ? (
          <div style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>
              <span>Cel mai recent turneu viitor</span>
            </div>
            <TournamentList
              tournaments={[latestUpcoming]}
              currentUserId={user?.id ?? null}
              canManageTournaments={canManageTournaments}
              users={users}
              onTournamentUpdated={handleTournamentUpdated}
            />
          </div>
        ) : null}

        {sortedTournaments.length > 0 ? (
          <TournamentList
            tournaments={
              canManageTournaments && latestUpcoming
                ? sortedTournaments.filter(
                    (t) => t.id !== latestUpcoming.id
                  )
                : sortedTournaments
            }
            currentUserId={user?.id ?? null}
            canManageTournaments={canManageTournaments}
            users={users}
            onTournamentUpdated={handleTournamentUpdated}
          />
        ) : canManageTournaments ? (
          <div className="card" style={{ marginTop: 16 }}>
            Nu exista turnee.
          </div>
        ) : (
          <div className="card" style={{ marginTop: 16 }}>
            Nu existÄƒ turnee disponibile. DacÄƒ eÈ™ti organizator,
            autentificÄƒ-te.
            <div style={{ marginTop: 12 }}>
              <Link href="/auth" className="cta-button">
                Autentificare organizator
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

