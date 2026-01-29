export type Role = "player" | "organizer" | "admin";

export type UserLevel = "hobby" | "avansati" | "open" | "elite";

export type UserProfile = {
  id: string;
  email?: string | null;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  mp_points: number | null;
  level: UserLevel | null;
  role?: Role;
};

export type EquipmentSetup = {
  forehand_rubber: string | null;
  backhand_rubber: string | null;
  blade: string | null;
};
