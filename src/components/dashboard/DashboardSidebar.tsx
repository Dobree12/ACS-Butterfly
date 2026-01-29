import Link from "next/link";
import type { EquipmentSetup, UserProfile } from "@/lib/types/user";
import type { UserStats } from "@/lib/hooks/useUserStats";

type Props = {
  profile: UserProfile | null;
  stats: UserStats | null;
  equipment: EquipmentSetup | null;
};

const levelLabel = (level?: string | null) => {
  switch (level) {
    case "avansati":
      return "Avansați";
    case "open":
      return "Open";
    case "elite":
      return "Elite";
    default:
      return "Hobby";
  }
};

export default function DashboardSidebar({ profile, stats, equipment }: Props) {
  const initials =
    profile?.first_name || profile?.last_name
      ? `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase()
      : "??";
  const levelClass = profile?.level ?? "hobby";

  return (
    <div className="sidebar">
      <div className="profile-card">
        <div className="avatar">{initials}</div>
        <div className="profile-name">
          {profile
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : "Vizitator"}
        </div>
        {profile ? (
          <>
            <span className={`profile-level ${levelClass}`}>
              {levelLabel(levelClass)}
            </span>
            <div className="mp-points">{profile.mp_points ?? 0}</div>
            <div className="mp-label">MP Points</div>
          </>
        ) : (
          <div style={{ marginTop: 12 }}>
            <Link href="/auth" className="edit-btn" style={{ display: "inline-block" }}>
              Autentificare
            </Link>
          </div>
        )}
      </div>

      <div className="stats-card">
        <h3>Statistici Generale</h3>
        {stats ? (
          <>
            <div className="stat-row">
              <span className="stat-label">Meciuri Jucate</span>
              <span className="stat-value">{stats.matchesPlayed}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Victorii</span>
              <span className="stat-value">{stats.wins}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Înfrângeri</span>
              <span className="stat-value">{stats.losses}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{stats.winRate}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Turnee</span>
              <span className="stat-value">{stats.tournaments}</span>
            </div>
          </>
        ) : (
          <div style={{ color: "var(--text-dim)" }}>
            Autentifică-te pentru statistici.
          </div>
        )}
      </div>

      <div className="equipment-card">
        <div className="equipment-title">Setup Rachetă</div>
        {equipment ? (
          <>
            <div className="equipment-item">
              <div className="equipment-label">Forehand</div>
              <div className="equipment-value">
                {equipment.forehand_rubber ?? "—"}
              </div>
            </div>
            <div className="equipment-item">
              <div className="equipment-label">Backhand</div>
              <div className="equipment-value">
                {equipment.backhand_rubber ?? "—"}
              </div>
            </div>
            <div className="equipment-item">
              <div className="equipment-label">Blade</div>
              <div className="equipment-value">{equipment.blade ?? "—"}</div>
            </div>
          </>
        ) : (
          <div style={{ color: "var(--text-dim)" }}>
            Nu există setup salvat.
          </div>
        )}
      </div>
    </div>
  );
}
