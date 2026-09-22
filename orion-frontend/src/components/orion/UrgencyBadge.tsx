"use client";

import { getUrgencyLevel } from "@/lib/orion-config";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  score: number;
  label?: string;
  className?: string;
  showScore?: boolean;
}

const urgencyStyles: Record<string, string> = {
  low: "orion-urgency-low",
  mild: "orion-urgency-mild",
  moderate: "orion-urgency-moderate",
  high: "orion-urgency-high",
  critical: "orion-urgency-critical",
};

export default function UrgencyBadge({
  score,
  label,
  className,
  showScore = true,
}: UrgencyBadgeProps) {
  const level = getUrgencyLevel(score);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold select-none",
        urgencyStyles[level],
        className
      )}
    >
      {showScore && (
        <span className="text-2xl font-bold tabular-nums">{score}</span>
      )}
      <span className="text-sm">{label || `Score: ${score}/10`}</span>
    </div>
  );
}
