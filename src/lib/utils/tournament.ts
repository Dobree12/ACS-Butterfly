import type { TournamentStatus } from "@/lib/types/tournament";

export const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) return "";
  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const statusLabel = (status?: TournamentStatus | null) => {
  switch (status) {
    case "ongoing":
      return "În desfășurare";
    case "upcoming":
      return "În curând";
    case "completed":
      return "Finalizat";
    case "cancelled":
      return "Anulat";
    default:
      return "Necunoscut";
  }
};
