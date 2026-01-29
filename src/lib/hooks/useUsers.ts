import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id,first_name,last_name,avatar_url,mp_points,level")
      .eq("is_active", true)
      .order("mp_points", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setUsers((data as UserProfile[]) ?? []);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    reload: loadUsers,
  };
};
