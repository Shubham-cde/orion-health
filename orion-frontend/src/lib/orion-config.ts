// ====== ORION-Health Configuration ======

export const URGENCY_LEVELS = {
  LOW: { min: 0, max: 3, label: "Low (Home Care)", color: "green" },
  MILD: { min: 3, max: 5, label: "Mild (OPD)", color: "yellow" },
  MODERATE: { min: 5, max: 7, label: "Moderate (Doctor Soon)", color: "orange" },
  HIGH: { min: 7, max: 9, label: "High (Priority)", color: "red" },
  CRITICAL: { min: 9, max: 10, label: "Critical (Emergency)", color: "darkred" },
} as const;

export const getUrgencyLevel = (score: number): string => {
  if (score < 3) return "low";
  if (score < 5) return "mild";
  if (score < 7) return "moderate";
  if (score < 9) return "high";
  return "critical";
};

export const getUrgencyColor = (score: number): string => {
  const level = getUrgencyLevel(score);
  const colorMap: Record<string, string> = {
    low: "bg-green-500",
    mild: "bg-yellow-500",
    moderate: "bg-orange-500",
    high: "bg-red-500",
    critical: "bg-red-700",
  };
  return colorMap[level] ?? "bg-gray-500";
};

export type Route =
  | "landing"
  | "pre-register"
  | "patient-register"
  | "admin-input"
  | "admin-doctor"
  | "admin-emergency"
  | "admin-history";
