"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserStats } from "@/lib/hooks/useUserStats";
import { useEquipmentSetup } from "@/lib/hooks/useEquipmentSetup";

type EquipmentForm = {
  forehand: string;
  backhand: string;
  blade: string;
};

type SaveState = {
  status: "idle" | "saving" | "success" | "error";
  message?: string;
};

export default function ProfilePage() {
  const { user, profile, role } = useAuth();
  const { stats } = useUserStats(user?.id);
  const { setup, reload } = useEquipmentSetup(user?.id);
  const [form, setForm] = useState<EquipmentForm>({
    forehand: "",
    backhand: "",
    blade: "",
  });
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isEditingSetup, setIsEditingSetup] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaveState({ status: "saving" });

    const { error: updateError } = await supabase
      .from("equipment_setups")
      .update({ is_current: false })
      .eq("user_id", user.id)
      .eq("is_current", true);

    if (updateError) {
      setSaveState({ status: "error", message: updateError.message });
      return;
    }

    const { error } = await supabase.from("equipment_setups").insert({
      user_id: user.id,
      forehand_rubber: form.forehand || null,
      backhand_rubber: form.backhand || null,
      blade: form.blade || null,
      is_current: true,
    });

    if (error) {
      setSaveState({ status: "error", message: error.message });
      return;
    }

    setSaveState({ status: "success", message: "Setup salvat." });
    setForm({ forehand: "", backhand: "", blade: "" });
    setIsEditingSetup(false);
    await reload();
  };

  return (
    <main className="main-content profile-page">
      <div className="container profile-container">
        <div className="section-header">
          <h2 className="section-title">Profil</h2>
        </div>

        {!user ? (
          <div className="card profile-empty">
            Trebuie să te autentifici pentru a vedea profilul.
            <div className="profile-empty-actions">
              <Link href="/auth" className="cta-button">
                Autentificare
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-grid">
              <div className="card profile-section">
              <div className="card-title">
                <span>Date cont</span>
              </div>
              <div className="profile-list">
                <div>
                  <strong>Nume:</strong>{" "}
                  {profile
                    ? `${profile.first_name} ${profile.last_name}`.trim()
                    : "—"}
                </div>
                <div>
                  <strong>Email:</strong> {user.email ?? "—"}
                </div>
                <div>
                  <strong>Rol:</strong> {role ?? "—"}
                </div>
                <div>
                  <strong>Nivel:</strong> {profile?.level ?? "—"}
                </div>
                <div>
                  <strong>MP Points:</strong> {profile?.mp_points ?? 0}
                </div>
              </div>
            </div>

            <div className="card profile-section">
              <div className="card-title">
                <span>Statistici</span>
              </div>
              {stats ? (
                <div className="profile-list">
                  <div>
                    <strong>Meciuri jucate:</strong> {stats.matchesPlayed}
                  </div>
                  <div>
                    <strong>Victorii:</strong> {stats.wins}
                  </div>
                  <div>
                    <strong>Înfrângeri:</strong> {stats.losses}
                  </div>
                  <div>
                    <strong>Win rate:</strong> {stats.winRate}%
                  </div>
                  <div>
                    <strong>Turnee:</strong> {stats.tournaments}
                  </div>
                </div>
              ) : (
                <div className="profile-muted">
                  Nu există statistici încă.
                </div>
              )}
            </div>

            <div className="card profile-section">
              <div className="card-title">
                <span>Setup curent</span>
              </div>
              {setup ? (
                <>
                  <div className="profile-list">
                    <div>
                      <strong>Forehand:</strong> {setup.forehand_rubber ?? "\u2014"}
                    </div>
                    <div>
                      <strong>Backhand:</strong> {setup.backhand_rubber ?? "\u2014"}
                    </div>
                    <div>
                      <strong>Blade:</strong> {setup.blade ?? "\u2014"}
                    </div>
                  </div>
                  {!isEditingSetup ? (
                    <div style={{ marginTop: 16 }}>
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => {
                          setForm({
                            forehand: setup.forehand_rubber ?? "",
                            backhand: setup.backhand_rubber ?? "",
                            blade: setup.blade ?? "",
                          });
                          setIsEditingSetup(true);
                        }}
                      >
                        Editeaza setup
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveSetup} className="profile-form" style={{ marginTop: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Forehand</label>
                        <input
                          type="text"
                          className="form-input"
                          value={form.forehand}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, forehand: e.target.value }))
                          }
                          placeholder="Ex: Tenergy 05"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Backhand</label>
                        <input
                          type="text"
                          className="form-input"
                          value={form.backhand}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, backhand: e.target.value }))
                          }
                          placeholder="Ex: Donic Barracuda"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Blade</label>
                        <input
                          type="text"
                          className="form-input"
                          value={form.blade}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, blade: e.target.value }))
                          }
                          placeholder="Ex: Viscaria"
                        />
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          type="submit"
                          className="save-btn"
                          disabled={saveState.status === "saving"}
                        >
                          {saveState.status === "saving"
                            ? "Se salveaza..."
                            : "Salveaza setup"}
                        </button>
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => {
                            setIsEditingSetup(false);
                            setSaveState({ status: "idle" });
                          }}
                        >
                          Renunta
                        </button>
                      </div>
                      {saveState.status === "error" ? (
                        <div className="profile-error">
                          {saveState.message}
                        </div>
                      ) : null}
                      {saveState.status === "success" ? (
                        <div className="profile-success">
                          {saveState.message}
                        </div>
                      ) : null}
                    </form>
                  )}
                </>
              ) : (
                <div className="profile-muted">
                  Nu există setup salvat.
                </div>
              )}
            </div>

            {!setup ? (
            <div className="card profile-section span-2">
              <div className="card-title">
                <span>Adaugă setup rachetă</span>
              </div>
              <form onSubmit={handleSaveSetup} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Forehand</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.forehand}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, forehand: e.target.value }))
                    }
                    placeholder="Ex: Tenergy 05"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Backhand</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.backhand}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, backhand: e.target.value }))
                    }
                    placeholder="Ex: Donic Barracuda"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.blade}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, blade: e.target.value }))
                    }
                    placeholder="Ex: Viscaria"
                  />
                </div>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saveState.status === "saving"}
                >
                  {saveState.status === "saving"
                    ? "Se salvează..."
                    : "Salvează setup"}
                </button>
                {saveState.status === "error" ? (
                  <div className="profile-error">
                    {saveState.message}
                  </div>
                ) : null}
                {saveState.status === "success" ? (
                  <div className="profile-success">
                    {saveState.message}
                  </div>
                ) : null}
              </form>
            </div>
            ) : null}

            <div className="card profile-section span-2 profile-actions">
              <button type="button" className="edit-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </main>
  );
}

