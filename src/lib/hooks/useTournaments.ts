import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tournament } from "@/lib/types/tournament";

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tournaments")
      .select(
        "id,name,description,format,start_date,end_date,status,max_players,best_of"
      )
      .order("start_date", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setTournaments((data as Tournament[]) ?? []);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
    reload: loadTournaments,
    setTournaments,
  };
};
