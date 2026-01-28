"use client";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseBrowser";

type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

type Tournament = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  max_players: number | null;
  best_of: number | null;
};

type TournamentFormat =
  | "round_robin"
  | "swiss"
  | "single_elimination"
  | "double_elimination";

type NewTournament = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  format: TournamentFormat;
  max_players: string;
  best_of: string;
};

type CreateState = {
  status: "idle" | "saving" | "success" | "error";
  message?: string;
};

type Role = "player" | "organizer" | "admin";

export default function Page() {
  const [active, setActive] = useState<
  "dashboard" | "tournaments" | "leaderboard" | "history" | "profile"|"rankings">("dashboard");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const [participants, setParticipants] = useState<any[]>([]);

  const [newTournament, setNewTournament] = useState<NewTournament>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    format: "round_robin",
    max_players: "16",
    best_of: "3",
  });
  const [createState, setCreateState] = useState<CreateState>({
    status: "idle",
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authRole, setAuthRole] = useState<Role | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id,name,start_date,end_date,status,max_players,best_of")
        .order("start_date", { ascending: false });

      if (error) {
        console.log("tournaments error:", error);
        return;
      }
      setTournaments((data as Tournament[]) ?? []);

      const tournamentId = data?.[0]?.id; // primul turneu din listă
      if (!tournamentId) return;

      const { data: partData, error: partErr } = await supabase
        .from("tournament_participants")
        .select("user_id, users(first_name,last_name,level,mp_points)")
        .eq("tournament_id", tournamentId);

      console.log("participants:", partData);
      console.log("participants error:", partErr);

      if (!partErr) setParticipants(partData ?? []);

    })();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("first_name,last_name,role")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("profile error:", error);
      setAuthRole(null);
      return;
    }

    setAuthRole((data?.role as Role) ?? "player");
  };

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("auth error:", error);
      }
      setAuthUser(data.user ?? null);
      if (data.user) {
        await loadProfile(data.user.id);
      } else {
        setAuthRole(null);
      }
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = session?.user ?? null;
        setAuthUser(nextUser);
        if (nextUser) {
          void loadProfile(nextUser.id);
        } else {
          setAuthRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const latestTournament = useMemo(
    () => (tournaments.length > 0 ? tournaments[0] : null),
    [tournaments]
  );

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatRange = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const statusLabel = (status?: TournamentStatus | null) => {
    switch (status) {
      case "ongoing":
        return "În desfășurare";
      case "upcoming":
        return "În curând";
      case "completed":
        return "Finalizat";
      case "cancelled":
        return "Anulat";
      default:
        return "Necunoscut";
    }
  };

  const sortTournaments = (items: Tournament[]) =>
    [...items].sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

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

    if (!authUser) {
      setCreateState({
        status: "error",
        message: "Trebuie sa fii autentificat pentru a crea turneu.",
      });
      return;
    }

    if (authRole !== "organizer" && authRole !== "admin") {
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
        created_by: authUser.id,
      })
      .select("id,name,start_date,end_date,status,max_players,best_of");

    if (error) {
      setCreateState({ status: "error", message: error.message });
      return;
    }

    const created = data?.[0] as Tournament | undefined;
    if (created) {
      setTournaments((prev) => sortTournaments([...prev, created]));
    }

    setCreateState({ status: "success", message: "Turneu creat." });
    setNewTournament((prev) => ({
      ...prev,
      name: "",
      description: "",
      start_date: "",
      end_date: "",
    }));
  };

  const canManageTournaments =
    authRole === "organizer" || authRole === "admin";

  return (
    <main>
      <body>
      <div className="background-pattern"></div>
      
  
      <nav>
          <div className="nav-container">
            <div className="logo">ACS Butterfly</div>
            <ul className="nav-links">
              <li>
                <a
                  href="#"
                  className={active === "dashboard" ? "is-active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("dashboard");
                  }}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={active === "tournaments" ? "is-active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("tournaments");
                  }}
                >
                  Turnee
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={active === "leaderboard" ? "is-active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("leaderboard");
                  }}
                >
                  Clasament
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={active === "history" ? "is-active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive("history");
                  }}
                >
                  Istoric
                </a>
              </li>
              <li>
                <a href="/auth">Autentificare</a>
              </li>
            </ul>
          </div>
      </nav>

            <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-content">
              <h1>ACS BUTTERFLY</h1>
              <p className="subtitle">Club de tenis de masă · Cluj-Napoca</p>
              <a href="#" className="cta-button" onClick={() => setActive("dashboard")}>Vezi Dashboard</a>
          </div>
      </section>

            <main className="main-content">
          <div className="container">
                            <div id="dashboard-section" className={`section ${active === "dashboard" ? "is-active" : ""}`} >
                  <div className="dashboard">
                                            <div className="sidebar">
                                                    <div className="profile-card">
                              <div className="avatar">AP</div>
                              <div className="profile-name">Andrei Popescu</div>
                              <span className="profile-level avansati">Avansați</span>
                              <div className="mp-points">15.75</div>
                              <div className="mp-label">MP Points</div>
                          </div>

                                                    <div className="stats-card">
                              <h3>Statistici Generale</h3>
                              <div className="stat-row">
                                  <span className="stat-label">Meciuri Jucate</span>
                                  <span className="stat-value">47</span>
                              </div>
                              <div className="stat-row">
                                  <span className="stat-label">Victorii</span>
                                  <span className="stat-value">28</span>
                              </div>
                              <div className="stat-row">
                                  <span className="stat-label">Înfrângeri</span>
                                  <span className="stat-value">19</span>
                              </div>
                              <div className="stat-row">
                                  <span className="stat-label">Win Rate</span>
                                  <span className="stat-value">59.6%</span>
                              </div>
                              <div className="stat-row">
                                  <span className="stat-label">Turnee</span>
                                  <span className="stat-value">8</span>
                              </div>
                          </div>

                                                    <div className="equipment-card">
                              <div className="equipment-title">Setup Rachetă</div>
                              <div className="equipment-item">
                                  <div className="equipment-label">Forehand</div>
                                  <div className="equipment-value">Tenergy 05</div>
                              </div>
                              <div className="equipment-item">
                                  <div className="equipment-label">Backhand</div>
                                  <div className="equipment-value">Donic Barracuda</div>
                              </div>
                              <div className="equipment-item">
                                  <div className="equipment-label">Blade</div>
                                  <div className="equipment-value">Viscaria</div>
                              </div>
                              <button className="edit-btn" >Editează Setup</button>
                          </div>
                      </div>

                                            <div className="content-area">
                                                    <div className="card">
                              <div className="tournament-header">
                                  <div className="tournament-info">
                                      <h3>{latestTournament ? latestTournament.name : "Niciun turneu activ"}</h3>
                                      {latestTournament ? (
                                        <div className="tournament-date">
                                          {formatRange(latestTournament.start_date, latestTournament.end_date)}
                                          {latestTournament.max_players ? ` · ${latestTournament.max_players} jucători` : ""}
                                          {latestTournament.best_of ? ` · Best of ${latestTournament.best_of}` : ""}
                                        </div>
                                      ) : null}
                                  </div>
                                  {latestTournament ? (
                                    <span
                                      className={`tournament-status ${
                                        latestTournament.status === "upcoming" ? "upcoming" : ""
                                      }`}
                                    >
                                      {statusLabel(latestTournament.status)}
                                    </span>
                                  ) : null}
                              </div>
                              <div className="leaderboard">
                                  <div className="leaderboard-item">
                                      <div className="rank gold">1</div>
                                      <div className="player-avatar">MC</div>
                                      <div className="player-info">
                                          <div className="player-name">Mihai Cristea</div>
                                          <div className="player-level">Elite</div>
                                      </div>
                                      <div className="player-points">12-1</div>
                                  </div>
                                  <div className="leaderboard-item">
                                      <div className="rank silver">2</div>
                                      <div className="player-avatar">AP</div>
                                      <div className="player-info">
                                          <div className="player-name">Andrei Popescu</div>
                                          <div className="player-level">Avansați</div>
                                      </div>
                                      <div className="player-points">10-3</div>
                                  </div>
                                  <div className="leaderboard-item">
                                      <div className="rank bronze">3</div>
                                      <div className="player-avatar">DV</div>
                                      <div className="player-info">
                                          <div className="player-name">Dan Vasile</div>
                                          <div className="player-level">Open</div>
                                      </div>
                                      <div className="player-points">9-4</div>
                                  </div>
                                  <div className="leaderboard-item">
                                      <div className="rank">4</div>
                                      <div className="player-avatar">IP</div>
                                      <div className="player-info">
                                          <div className="player-name">Ion Popa</div>
                                          <div className="player-level">Avansați</div>
                                      </div>
                                      <div className="player-points">8-5</div>
                                  </div>
                              </div>
                          </div>

                                                    <div className="card">
                              <div className="card-title">
                                  <span>Meciuri Recente</span>
                              </div>
                              <div className="match-list">
                                  <div className="match-item win">
                                      <div className="match-players">
                                          <div className="match-player winner">Andrei Popescu</div>
                                          <div className="match-player">Vlad Ionescu</div>
                                      </div>
                                      <div className="match-score">
                                          2-0
                                          <div className="match-sets">11-8, 11-6</div>
                                      </div>
                                      <div className="match-date">27 Ian 2026</div>
                                  </div>
                                  <div className="match-item loss">
                                      <div className="match-players">
                                          <div className="match-player">Andrei Popescu</div>
                                          <div className="match-player winner">Mihai Cristea</div>
                                      </div>
                                      <div className="match-score">
                                          0-2
                                          <div className="match-sets">7-11, 9-11</div>
                                      </div>
                                      <div className="match-date">26 Ian 2026</div>
                                  </div>
                                  <div className="match-item win">
                                      <div className="match-players">
                                          <div className="match-player winner">Andrei Popescu</div>
                                          <div className="match-player">George Stan</div>
                                      </div>
                                      <div className="match-score">
                                          2-1
                                          <div className="match-sets">11-9, 8-11, 11-7</div>
                                      </div>
                                      <div className="match-date">25 Ian 2026</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

                            <div id="tournaments-section" className={`section ${active === "tournaments" ? "is-active" : ""}`}>
                  <div className="section-header">
                      <h2 className="section-title">Turnee</h2>
                      <div className="tabs">
                          <button className="tab active">Curente</button>
                          <button className="tab">Viitoare</button>
                          <button className="tab">Finalizate</button>
                      </div>
                  </div>
                  {canManageTournaments ? (
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-title">
                            <span>Creeaza turneu</span>
                        </div>
                        <form onSubmit={handleCreateTournament} style={{ display: "grid", gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Nume</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={newTournament.name}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  placeholder="Ex: Turneu Saptamanal #12"
                                  required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descriere</label>
                                <textarea
                                  className="form-input"
                                  value={newTournament.description}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  placeholder="Descriere (optional)"
                                  rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Data start</label>
                                <input
                                  type="date"
                                  className="form-input"
                                  value={newTournament.start_date}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      start_date: e.target.value,
                                    }))
                                  }
                                  required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Data sfarsit</label>
                                <input
                                  type="date"
                                  className="form-input"
                                  value={newTournament.end_date}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      end_date: e.target.value,
                                    }))
                                  }
                                  required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                  className="form-input"
                                  value={newTournament.status}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      status: e.target.value as TournamentStatus,
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
                                  value={newTournament.format}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      format: e.target.value as TournamentFormat,
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
                                  value={newTournament.max_players}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
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
                                  value={newTournament.best_of}
                                  onChange={(e) =>
                                    setNewTournament((prev) => ({
                                      ...prev,
                                      best_of: e.target.value,
                                    }))
                                  }
                                />
                            </div>
                            <button
                              type="submit"
                              className="save-btn"
                              disabled={createState.status === "saving"}
                            >
                              {createState.status === "saving" ? "Se salveaza..." : "Creeaza turneu"}
                            </button>
                            {createState.status === "error" ? (
                              <div style={{ color: "var(--primary)" }}>
                                {createState.message}
                              </div>
                            ) : null}
                            {createState.status === "success" ? (
                              <div style={{ color: "var(--success)" }}>
                                {createState.message}
                              </div>
                            ) : null}
                        </form>
                    </div>
                  ) : null}
                  {tournaments.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      {tournaments.map((t) => (
                        <div key={t.id} style={{ marginBottom: 12 }}>
                          <strong>{t.name}</strong>
                          <div className="tournament-date">
                            {formatRange(t.start_date, t.end_date)}
                            {t.max_players ? ` · ${t.max_players} jucători` : ""}
                            {t.best_of ? ` · Best of ${t.best_of}` : ""}
                          </div>
                          <span
                            className={`tournament-status ${
                              t.status === "upcoming" ? "upcoming" : ""
                            }`}
                          >
                            {statusLabel(t.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : canManageTournaments ? (
                    <div className="card" style={{ marginTop: 16 }}>
                      Nu există turnee încă.
                    </div>
                  ) : (
                    <div className="card" style={{ marginTop: 16 }}>
                      Nu există turnee disponibile. Dacă ești organizator,
                      autentifică-te.
                      <div style={{ marginTop: 12 }}>
                        <a href="/auth" className="cta-button">
                          Autentificare organizator
                        </a>
                      </div>
                    </div>
                  )}
              </div>

                            <div id="rankings-section" className={`section ${active === "leaderboard" ? "is-active" : ""}`} >
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
                  <div className="rankings-grid">
                      <div className="player-card">
                          <div className="player-card-avatar">MC</div>
                          <div className="player-card-name">Mihai Cristea</div>
                          <span className="player-card-level player-card-level-elite" >Elite</span>
                          <div className="player-card-mp">32.5</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                      <div className="player-card">
                          <div className="player-card-avatar">DV</div>
                          <div className="player-card-name">Dan Vasile</div>
                          <span className="player-card-level player-card-level-open" >Open</span>
                          <div className="player-card-mp">24.3</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                      <div className="player-card">
                          <div className="player-card-avatar">IP</div>
                          <div className="player-card-name">Ion Popa</div>
                          <span className="player-card-level player-card-level-avansati" >Avansați</span>
                          <div className="player-card-mp">17.2</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                      <div className="player-card">
                          <div className="player-card-avatar">AP</div>
                          <div className="player-card-name">Andrei Popescu</div>
                          <span className="player-card-level" >Avansați</span>
                          <div className="player-card-mp">15.75</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                      <div className="player-card">
                          <div className="player-card-avatar">VI</div>
                          <div className="player-card-name">Vlad Ionescu</div>
                          <span className="player-card-level player-card-level-avansati" >Avansați</span>
                          <div className="player-card-mp">12.8</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                      <div className="player-card">
                          <div className="player-card-avatar">GS</div>
                          <div className="player-card-name">George Stan</div>
                          <span className=" player-card-level player-card-level-hobby ">Hobby</span>
                          <div className="player-card-mp">8.5</div>
                          <div className="mp-label">MP Points</div>
                      </div>
                  </div>
              </div>

                            <div id="history-section" className={`section ${active === "history" ? "is-active" : ""}`}>
                  <div className="section-header">
                      <h2 className="section-title">Istoric Complet</h2>
                  </div>
                  <div className="card">
                      <div className="card-title">
                          <span>Toate Meciurile</span>
                      </div>
                      <div className="match-list">
                          <div className="match-item win">
                              <div className="match-players">
                                  <div className="match-player winner">Andrei Popescu</div>
                                  <div className="match-player">Vlad Ionescu</div>
                              </div>
                              <div className="match-score">
                                  2-0
                                  <div className="match-sets">11-8, 11-6</div>
                              </div>
                              <div className="match-date">27 Ian 2026 · Turneu #12</div>
                          </div>
                          <div className="match-item loss">
                              <div className="match-players">
                                  <div className="match-player">Andrei Popescu</div>
                                  <div className="match-player winner">Mihai Cristea</div>
                              </div>
                              <div className="match-score">
                                  0-2
                                  <div className="match-sets">7-11, 9-11</div>
                              </div>
                              <div className="match-date">26 Ian 2026 · Turneu #12</div>
                          </div>
                          <div className="match-item win">
                              <div className="match-players">
                                  <div className="match-player winner">Andrei Popescu</div>
                                  <div className="match-player">George Stan</div>
                              </div>
                              <div className="match-score">
                                  2-1
                                  <div className="match-sets">11-9, 8-11, 11-7</div>
                              </div>
                              <div className="match-date">25 Ian 2026 · Turneu #12</div>
                          </div>
                          <div className="match-item win">
                              <div className="match-players">
                                  <div className="match-player winner">Andrei Popescu</div>
                                  <div className="match-player">Dan Vasile</div>
                              </div>
                              <div className="match-score">
                                  2-0
                                  <div className="match-sets">11-9, 11-7</div>
                              </div>
                              <div className="match-date">20 Ian 2026 · Turneu #11</div>
                          </div>
                          <div className="match-item loss">
                              <div className="match-players">
                                  <div className="match-player">Andrei Popescu</div>
                                  <div className="match-player winner">Ion Popa</div>
                              </div>
                              <div className="match-score">
                                  1-2
                                  <div className="match-sets">11-9, 6-11, 8-11</div>
                              </div>
                              <div className="match-date">19 Ian 2026 · Turneu #11</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </main>

  
      <div id="equipment-modal" className="modal">
          <div className="modal-content">
              <div className="modal-header">
                  <h2 className="modal-title">Editează Setup Rachetă</h2>
                  <button className="close-btn" >&times;</button>
              </div>
              <form id="equipment-form">
                  <div className="form-group">
                      <label className="form-label">Forehand</label>
                      <input type="text" className="form-input" id="forehand" defaultValue="Tenergy 05" placeholder="Ex: Tenergy 05"/>
                  </div>
                  <div className="form-group">
                      <label className="form-label">Backhand</label>
                      <input type="text" className="form-input" id="backhand" defaultValue="Donic Barracuda" placeholder="Ex: Donic Barracuda"/>
                  </div>
                  <div className="form-group">
                      <label className="form-label">Blade</label>
                      <input type="text" className="form-input" id="blade" defaultValue="Viscaria" placeholder="Ex: Viscaria"/>
                  </div>
                  <button type="submit" className="save-btn">Salvează Modificările</button>
              </form>
          </div>
      </div>
    </body>
    </main>
  );
}
