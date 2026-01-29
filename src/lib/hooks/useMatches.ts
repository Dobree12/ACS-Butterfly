import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Match } from "@/lib/types/match";

type Options = {
  userId?: string | null;
  limit?: number;
};

export const useMatches = ({ userId, limit }: Options = {}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    setLoading(true);
    let query = supabase
      .from("matches")
      .select(
        "id,match_date,player1_score,player2_score,winner_id,player1:users!player1_id(id,first_name,last_name,level,mp_points),player2:users!player2_id(id,first_name,last_name,level,mp_points),tournament:tournaments(name)"
      )
      .order("match_date", { ascending: false });

    if (userId) {
      query = query.or(`player1_id.eq.${userId},player2_id.eq.${userId}`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      player1: Array.isArray(row.player1) ? row.player1[0] : row.player1,
      player2: Array.isArray(row.player2) ? row.player2[0] : row.player2,
      tournament: Array.isArray(row.tournament)
        ? row.tournament[0]
        : row.tournament,
    })) as Match[];

    setMatches(normalized);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadMatches();
  }, [userId, limit]);

  return {
    matches,
    loading,
    error,
    reload: loadMatches,
  };
};
