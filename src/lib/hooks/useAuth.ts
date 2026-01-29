import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Role, UserProfile } from "@/lib/types/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id,email,first_name,last_name,avatar_url,mp_points,level,role")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("profile error:", error);
      setRole(null);
      setProfile(null);
      return;
    }

    const normalizedRole =
      data?.role === "admin" ? "organizer" : ((data?.role as Role) ?? "player");
    setRole(normalizedRole);
    setProfile({
      id: data?.id ?? userId,
      email: data?.email ?? null,
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
      avatar_url: data?.avatar_url ?? null,
      mp_points: data?.mp_points ?? 0,
      level: (data?.level as UserProfile["level"]) ?? "hobby",
      role: normalizedRole,
    });
  };

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("auth error:", error);
      }
      setUser(data.user ?? null);
      if (data.user) {
        await loadProfile(data.user.id);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          void loadProfile(nextUser.id);
        } else {
          setRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    profile,
    loading,
  };
};
