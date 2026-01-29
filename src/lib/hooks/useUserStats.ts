import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type UserStats = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  tournaments: number;
};

export const useUserStats = (userId?: string | null) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setStats(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("id,player1_id,player2_id,winner_id")
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);

      if (matchError) {
        console.log("stats match error:", matchError);
      }

      const matchesPlayed = matches?.length ?? 0;
      const wins = matches?.filter((m) => m.winner_id === userId).length ?? 0;
      const losses =
        matches?.filter((m) => m.winner_id && m.winner_id !== userId).length ??
        0;
      const winRate =
        matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

      const { data: tournaments, error: tournError } = await supabase
        .from("tournament_participants")
        .select("id")
        .eq("user_id", userId);

      if (tournError) {
        console.log("stats tournaments error:", tournError);
      }

      setStats({
        matchesPlayed,
        wins,
        losses,
        winRate,
        tournaments: tournaments?.length ?? 0,
      });
      setLoading(false);
    };

    void loadStats();
  }, [userId]);

  return { stats, loading };
};
