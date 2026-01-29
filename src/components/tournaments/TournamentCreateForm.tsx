import type { FormEvent } from "react";
import type {
  NewTournament,
  TournamentFormat,
  TournamentStatus,
} from "@/lib/types/tournament";

type Props = {
  value: NewTournament;
  onChange: (value: NewTournament) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  state: { status: "idle" | "saving" | "success" | "error"; message?: string };
};

export default function TournamentCreateForm({
  value,
  onChange,
  onSubmit,
  state,
}: Props) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title">
        <span>Creează turneu</span>
      </div>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Nume</label>
          <input
            type="text"
            className="form-input"
            value={value.name}
            onChange={(e) =>
              onChange({
                ...value,
                name: e.target.value,
              })
            }
            placeholder="Ex: Turneu Săptămânal #12"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Descriere</label>
          <textarea
            className="form-input"
            value={value.description}
            onChange={(e) =>
              onChange({
                ...value,
                description: e.target.value,
              })
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
            value={value.start_date}
            onChange={(e) =>
              onChange({
                ...value,
                start_date: e.target.value,
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Data sfârșit</label>
          <input
            type="date"
            className="form-input"
            value={value.end_date}
            onChange={(e) =>
              onChange({
                ...value,
                end_date: e.target.value,
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={value.status}
            onChange={(e) =>
              onChange({
                ...value,
                status: e.target.value as TournamentStatus,
              })
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
            value={value.format}
            onChange={(e) =>
              onChange({
                ...value,
                format: e.target.value as TournamentFormat,
              })
            }
          >
            <option value="round_robin">round_robin</option>
            <option value="swiss">swiss</option>
            <option value="single_elimination">single_elimination</option>
            <option value="double_elimination">double_elimination</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Jucători max</label>
          <input
            type="number"
            min={2}
            className="form-input"
            value={value.max_players}
            onChange={(e) =>
              onChange({
                ...value,
                max_players: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Best of</label>
          <input
            type="number"
            min={1}
            className="form-input"
            value={value.best_of}
            onChange={(e) =>
              onChange({
                ...value,
                best_of: e.target.value,
              })
            }
          />
        </div>
        <button
          type="submit"
          className="save-btn"
          disabled={state.status === "saving"}
        >
          {state.status === "saving" ? "Se salvează..." : "Creează turneu"}
        </button>
        {state.status === "error" ? (
          <div style={{ color: "var(--primary)" }}>{state.message}</div>
        ) : null}
        {state.status === "success" ? (
          <div style={{ color: "var(--success)" }}>{state.message}</div>
        ) : null}
      </form>
    </div>
  );
}
