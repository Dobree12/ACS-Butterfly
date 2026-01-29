"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useTournamentParticipants } from "@/lib/hooks/useTournamentParticipants";
import type { NewTournament, Tournament } from "@/lib/types/tournament";
import type { UserProfile } from "@/lib/types/user";
import { formatRange, statusLabel } from "@/lib/utils/tournament";

type ActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

type Props = {
  tournament: Tournament;
  currentUserId?: string | null;
  canManageTournaments?: boolean;
  users?: UserProfile[];
  onTournamentUpdated?: (tournament: Tournament) => void;
};

export default function TournamentCard({
  tournament,
  currentUserId,
  canManageTournaments = false,
  users = [],
  onTournamentUpdated,
}: Props) {
  const { participants, loading, error, reload } =
    useTournamentParticipants(tournament.id);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [actionState, setActionState] = useState<ActionState>({
    status: "idle",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<ActionState>({
    status: "idle",
  });
  const [editForm, setEditForm] = useState<NewTournament>({
    name: tournament.name,
    description: tournament.description ?? "",
    start_date: tournament.start_date,
    end_date: tournament.end_date,
    status: tournament.status,
    format: tournament.format ?? "round_robin",
    max_players: tournament.max_players?.toString() ?? "",
    best_of: tournament.best_of?.toString() ?? "",
  });

  const isUpcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tournament.start_date);
    startDate.setHours(0, 0, 0, 0);
    return (
      tournament.status === "upcoming" ||
      startDate.getTime() >= today.getTime()
    );
  }, [tournament.start_date, tournament.status]);

  const isPast = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(tournament.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate.getTime() < today.getTime();
  }, [tournament.end_date]);

  const isRegistered = useMemo(() => {
    if (!currentUserId) return false;
    return participants.some((p) => p.user_id === currentUserId);
  }, [participants, currentUserId]);

  const handleSelfRegister = async () => {
    if (!currentUserId) return;
    setActionState({ status: "loading" });
    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: tournament.id,
      user_id: currentUserId,
    });

    if (error) {
      setActionState({ status: "error", message: error.message });
      return;
    }

    setActionState({ status: "success", message: "Inscriere reusita." });
    await reload();
  };

  const handleWithdraw = async () => {
    if (!currentUserId) return;
    setActionState({ status: "loading" });
    const { error } = await supabase
      .from("tournament_participants")
      .delete()
      .eq("tournament_id", tournament.id)
      .eq("user_id", currentUserId);

    if (error) {
      setActionState({ status: "error", message: error.message });
      return;
    }

    setActionState({ status: "success", message: "Te-ai retras din turneu." });
    await reload();
  };

  const handleAdminRegister = async () => {
    if (!selectedUserId) return;
    setActionState({ status: "loading" });
    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: tournament.id,
      user_id: selectedUserId,
    });

    if (error) {
      setActionState({ status: "error", message: error.message });
      return;
    }

    setActionState({ status: "success", message: "Jucator inscris." });
    setSelectedUserId("");
    await reload();
  };

  const handleAdminRemove = async (userId: string) => {
    setActionState({ status: "loading" });
    const { error } = await supabase
      .from("tournament_participants")
      .delete()
      .eq("tournament_id", tournament.id)
      .eq("user_id", userId);

    if (error) {
      setActionState({ status: "error", message: error.message });
      return;
    }

    setActionState({ status: "success", message: "Jucator retras." });
    await reload();
  };

  const handleUpdateTournament = async () => {
    setEditState({ status: "loading" });
    if (!editForm.name.trim()) {
      setEditState({ status: "error", message: "Completeaza numele turneului." });
      return;
    }

    if (!editForm.start_date || !editForm.end_date) {
      setEditState({
        status: "error",
        message: "Completeaza data de start si data de sfarsit.",
      });
      return;
    }

    const maxPlayersValue = editForm.max_players.trim();
    const bestOfValue = editForm.best_of.trim();
    const maxPlayers = maxPlayersValue ? Number(maxPlayersValue) : null;
    const bestOf = bestOfValue ? Number(bestOfValue) : null;

    const { data, error } = await supabase
      .from("tournaments")
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        status: editForm.status,
        format: editForm.format,
        max_players: Number.isFinite(maxPlayers) ? maxPlayers : null,
        best_of: Number.isFinite(bestOf) ? bestOf : null,
      })
      .eq("id", tournament.id)
      .select(
        "id,name,description,format,start_date,end_date,status,max_players,best_of"
      )
      .single();

    if (error) {
      setEditState({ status: "error", message: error.message });
      return;
    }

    if (data) {
      onTournamentUpdated?.(data as Tournament);
      setEditState({ status: "success", message: "Turneu actualizat." });
      setIsEditing(false);
    }
  };

  return (
    <div className="card tournament-card">
      <div className="tournament-header">
        <div className="tournament-info">
          <h3>{tournament.name}</h3>
          <div className="tournament-date">
            {formatRange(tournament.start_date, tournament.end_date)}
            {tournament.max_players
              ? ` · ${tournament.max_players} jucatori`
              : ""}
            {tournament.best_of ? ` · Best of ${tournament.best_of}` : ""}
          </div>
        </div>
        <span
          className={`tournament-status ${
            !isPast && tournament.status === "upcoming" ? "upcoming" : ""
          }`}
        >
          {isPast ? "Finalizat" : statusLabel(tournament.status)}
        </span>
      </div>

      <div className="tournament-actions">
        {!isPast && isUpcoming ? (
          <>
            {currentUserId ? (
              isRegistered ? (
                <button
                  type="button"
                  className="edit-btn"
                  onClick={handleWithdraw}
                  disabled={actionState.status === "loading"}
                >
                  Retrage-te
                </button>
              ) : (
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSelfRegister}
                  disabled={actionState.status === "loading"}
                >
                  Inscrie-te
                </button>
              )
            ) : (
              <Link href="/auth" className="cta-button">
                Autentifica-te pentru inscriere
              </Link>
            )}
          </>
        ) : (
          <div className="profile-muted">
            {isPast
              ? "Turneul este finalizat. Inscrierile nu mai sunt disponibile."
              : "Inscrierile sunt disponibile doar pentru turneele viitoare."}
          </div>
        )}

        {canManageTournaments ? (
          <div className="tournament-admin">
            <select
              className="form-input"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">Selecteaza jucator</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="save-btn"
              onClick={handleAdminRegister}
              disabled={actionState.status === "loading" || !selectedUserId}
            >
              Inscrie jucator
            </button>
          </div>
        ) : null}
      </div>

      {canManageTournaments ? (
        <div className="tournament-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="edit-btn"
            onClick={() => {
              setEditForm({
                name: tournament.name,
                description: tournament.description ?? "",
                start_date: tournament.start_date,
                end_date: tournament.end_date,
                status: tournament.status,
                format: tournament.format ?? "round_robin",
                max_players: tournament.max_players?.toString() ?? "",
                best_of: tournament.best_of?.toString() ?? "",
              });
              setEditState({ status: "idle" });
              setIsEditing((prev) => !prev);
            }}
          >
            {isEditing ? "Renunta la editare" : "Editeaza turneu"}
          </button>
        </div>
      ) : null}

      {canManageTournaments && isEditing ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">
            <span>Editare turneu</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nume</label>
              <input
                type="text"
                className="form-input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descriere</label>
              <textarea
                className="form-input"
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data start</label>
              <input
                type="date"
                className="form-input"
                value={editForm.start_date}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data sfarsit</label>
              <input
                type="date"
                className="form-input"
                value={editForm.end_date}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as NewTournament["status"],
                  }))
                }
              >
                <option value="upcoming">upcoming</option>
                <option value="ongoing">ongoing</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <select
                className="form-input"
                value={editForm.format}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    format: e.target.value as NewTournament["format"],
                  }))
                }
              >
                <option value="round_robin">round_robin</option>
                <option value="swiss">swiss</option>
                <option value="single_elimination">single_elimination</option>
                <option value="double_elimination">double_elimination</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Jucatori max</label>
              <input
                type="number"
                min={2}
                className="form-input"
                value={editForm.max_players}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    max_players: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Best of</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={editForm.best_of}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    best_of: e.target.value,
                  }))
                }
              />
            </div>
            <button
              type="button"
              className="save-btn"
              onClick={handleUpdateTournament}
              disabled={editState.status === "loading"}
            >
              {editState.status === "loading"
                ? "Se salveaza..."
                : "Salveaza modificari"}
            </button>
            {editState.status === "error" ? (
              <div className="profile-error">{editState.message}</div>
            ) : null}
            {editState.status === "success" ? (
              <div className="profile-success">{editState.message}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {actionState.status === "error" ? (
        <div className="profile-error" style={{ marginTop: 10 }}>
          {actionState.message}
        </div>
      ) : null}
      {actionState.status === "success" ? (
        <div className="profile-success" style={{ marginTop: 10 }}>
          {actionState.message}
        </div>
      ) : null}

      <div className="tournament-participants">
        <div className="card-title">
          <span>Participanti</span>
          <span className="tournament-count">
            {participants.length}
            {tournament.max_players ? ` / ${tournament.max_players}` : ""}
          </span>
        </div>

        {loading ? (
          <div className="profile-muted">Se incarca participantii...</div>
        ) : error ? (
          <div className="profile-error">{error}</div>
        ) : participants.length === 0 ? (
          <div className="profile-muted">Nu exista inscrieri inca.</div>
        ) : (
          <div className="leaderboard">
            {participants.map((participant) => (
              <div key={participant.id} className="leaderboard-item">
                <div className="player-avatar">
                  {participant.user.first_name?.[0] ?? "?"}
                  {participant.user.last_name?.[0] ?? ""}
                </div>
                <div className="player-info">
                  <div className="player-name">
                    {participant.user.first_name} {participant.user.last_name}
                  </div>
                  <div className="player-level">
                    {participant.user.level ?? "Open"} ·{" "}
                    {participant.user.mp_points ?? 0} MP
                  </div>
                </div>
                {canManageTournaments ? (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleAdminRemove(participant.user_id)}
                    disabled={actionState.status === "loading"}
                  >
                    Scoate
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
