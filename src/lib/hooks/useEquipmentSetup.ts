import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { EquipmentSetup } from "@/lib/types/user";

export const useEquipmentSetup = (userId?: string | null) => {
  const [setup, setSetup] = useState<EquipmentSetup | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSetup = async () => {
    if (!userId) {
      setSetup(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("equipment_setups")
      .select("forehand_rubber,backhand_rubber,blade,is_current")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("equipment error:", error);
      setSetup(null);
      setLoading(false);
      return;
    }

    const current = data?.find((item) => item.is_current) ?? data?.[0];
    if (current) {
      setSetup({
        forehand_rubber: current.forehand_rubber ?? null,
        backhand_rubber: current.backhand_rubber ?? null,
        blade: current.blade ?? null,
      });
    } else {
      setSetup(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadSetup();
  }, [userId]);

  return { setup, loading, reload: loadSetup };
};
