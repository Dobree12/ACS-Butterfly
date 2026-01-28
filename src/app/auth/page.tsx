"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseBrowser";

type Role = "player" | "organizer" | "admin";
type AuthMode = "login" | "register";

type AuthForm = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: Role;
};

type AuthState = {
  status: "idle" | "loading" | "error" | "success";
  message?: string;
};

export default function AuthPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authRole, setAuthRole] = useState<Role | null>(null);
  const [authProfileName, setAuthProfileName] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "player",
  });
  const [authState, setAuthState] = useState<AuthState>({
    status: "idle",
  });

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("first_name,last_name,role")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("profile error:", error);
      setAuthRole(null);
      setAuthProfileName(null);
      return;
    }

    setAuthRole((data?.role as Role) ?? "player");
    setAuthProfileName({
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
    });
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
        setAuthProfileName(null);
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
          setAuthProfileName(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthState({ status: "loading" });

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthState({
        status: "error",
        message: "Completeaza email si parola.",
      });
      return;
    }

    if (authMode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email.trim(),
        password: authForm.password,
        options: {
          data: {
            first_name: authForm.first_name.trim(),
            last_name: authForm.last_name.trim(),
          },
        },
      });

      if (error) {
        setAuthState({ status: "error", message: error.message });
        return;
      }

      if (data.session?.user && authForm.role !== "player") {
        const { error: roleError } = await supabase
          .from("users")
          .update({ role: authForm.role })
          .eq("id", data.session.user.id);

        if (roleError) {
          setAuthState({ status: "error", message: roleError.message });
          return;
        }
        await loadProfile(data.session.user.id);
      }

      setAuthState({
        status: "success",
        message:
          data.session?.user
            ? "Cont creat si autentificat."
            : "Cont creat. Verifica emailul pentru confirmare.",
      });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password,
      });

      if (error) {
        setAuthState({ status: "error", message: error.message });
        return;
      }

      setAuthState({ status: "success", message: "Autentificat." });
    }

    setAuthForm((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthState({ status: "idle" });
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="card-title">
            <span>Autentificare</span>
          </div>
          {authUser ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <strong>Autentificat ca:</strong> {authUser.email}
              </div>
              <div>
                <strong>Nume:</strong>{" "}
                {authProfileName
                  ? `${authProfileName.first_name} ${authProfileName.last_name}`.trim()
                  : "-"}
              </div>
              <div>
                <strong>Rol:</strong> {authRole ?? "-"}
              </div>
              <button type="button" className="edit-btn" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: 12 }}>
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${authMode === "login" ? "active" : ""}`}
                  onClick={() => {
                    setAuthMode("login");
                    setAuthState({ status: "idle" });
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`tab ${authMode === "register" ? "active" : ""}`}
                  onClick={() => {
                    setAuthMode("register");
                    setAuthState({ status: "idle" });
                  }}
                >
                  Register
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Parola</label>
                <input
                  type="password"
                  className="form-input"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              {authMode === "register" ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Prenume</label>
                    <input
                      type="text"
                      className="form-input"
                      value={authForm.first_name}
                      onChange={(e) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nume</label>
                    <input
                      type="text"
                      className="form-input"
                      value={authForm.last_name}
                      onChange={(e) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-input"
                      value={authForm.role}
                      onChange={(e) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          role: e.target.value as Role,
                        }))
                      }
                    >
                      <option value="player">Jucator</option>
                      <option value="organizer">Organizator</option>
                    </select>
                  </div>
                </>
              ) : null}
              <button
                type="submit"
                className="save-btn"
                disabled={authState.status === "loading"}
              >
                {authState.status === "loading"
                  ? "Se proceseaza..."
                  : authMode === "login"
                  ? "Login"
                  : "Register"}
              </button>
              {authState.status === "error" ? (
                <div style={{ color: "var(--primary)" }}>
                  {authState.message}
                </div>
              ) : null}
              {authState.status === "success" ? (
                <div style={{ color: "var(--success)" }}>
                  {authState.message}
                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
