import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  value: number; // 0-100
  label: string;
  level: "Low" | "Medium" | "High";
  className?: string;
}

export function RiskGauge({ value, label, level, className }: RiskGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const rotation = -90 + (clampedValue / 100) * 180;

  const gaugeColor =
    level === "High" ? "hsl(var(--destructive))" :
    level === "Medium" ? "hsl(var(--warning))" :
    "hsl(var(--success))";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(clampedValue / 100) * 157} 157`}
            className="transition-all duration-700 ease-out"
          />
          {/* Needle */}
          <line
            x1="60"
            y1="55"
            x2="60"
            y2="15"
            stroke={gaugeColor}
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${rotation}, 60, 55)`}
            className="transition-all duration-700 ease-out"
          />
          <circle cx="60" cy="55" r="4" fill={gaugeColor} />
        </svg>
      </div>
      <span className="font-mono text-lg font-bold text-foreground">{clampedValue.toFixed(1)}%</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
