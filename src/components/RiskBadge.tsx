import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RiskBadgeProps {
  level: "Low" | "Medium" | "High";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        level === "Low" && "risk-low",
        level === "Medium" && "risk-medium",
        level === "High" && "risk-high",
        className
      )}
    >
      {level === "High" && <AlertTriangle className="h-3 w-3" />}
      {level === "Medium" && <AlertCircle className="h-3 w-3" />}
      {level === "Low" && <Info className="h-3 w-3" />}
      {level}
    </span>
  );
}
