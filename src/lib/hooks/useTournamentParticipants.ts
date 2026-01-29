import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { TournamentParticipant } from "@/lib/types/tournament";

export const useTournamentParticipants = (
  tournamentId?: string | null
) => {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = async () => {
    if (!tournamentId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("tournament_participants")
      .select(
        "id,user_id,total_wins,total_losses,user:users(first_name,last_name,level,mp_points)"
      )
      .eq("tournament_id", tournamentId)
      .order("total_wins", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      user: Array.isArray(row.user) ? row.user[0] : row.user,
    })) as TournamentParticipant[];

    setParticipants(normalized);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadParticipants();
  }, [tournamentId]);

  return {
    participants,
    loading,
    error,
    reload: loadParticipants,
  };
};
