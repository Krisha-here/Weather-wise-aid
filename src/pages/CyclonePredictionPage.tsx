import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import { fetchCycloneAnalysis, fetchHistorical, getMonsoonType, type CycloneAnalysis, type HistoricalPoint } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskGauge } from "@/components/RiskGauge";
import { Wind, Gauge, Thermometer, Droplets, TrendingUp } from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { motion } from "framer-motion";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: 12,
};

export default function CyclonePredictionPage() {
  const { selectedDate } = useDateContext();
  const [data, setData] = useState<CycloneAnalysis | null>(null);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);

  useEffect(() => {
    fetchCycloneAnalysis(selectedDate).then(setData);
    fetchHistorical().then(setHistorical);
  }, [selectedDate]);

  if (!data) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const { risk, intensificationProbability, gradeEscalation, windDistribution, pressureDropTrend, severityScore } = data;

  const params = [
    { icon: Wind, label: "Wind Speed", value: `${risk.windSpeed} km/h` },
    { icon: Gauge, label: "Atm. Pressure", value: `${risk.pressure} hPa` },
    { icon: Thermometer, label: "Sea Surface Temp", value: `${risk.seaSurfaceTemp}°C` },
    { icon: Droplets, label: "Category", value: risk.category },
  ];

  const windData = [{ name: "Wind", value: Math.min(risk.windSpeed, 200), fill: "hsl(var(--destructive))" }];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cyclone Risk Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">AI cyclone tracking model — API driven</p>
        </div>
        <RiskBadge level={risk.level} className="text-sm px-4 py-1.5" />
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Intensification Prob.</p>
            <p className="font-mono text-xl font-bold">{intensificationProbability}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wind className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Grade Escalation</p>
            <p className="font-mono text-xs font-bold mt-1">{gradeEscalation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Severity Score</p>
            <p className="font-mono text-xl font-bold">{severityScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Sea Surface Temp</p>
            <p className="font-mono text-xl font-bold">{risk.seaSurfaceTemp}°C</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="h-full flex flex-col items-center justify-center py-8">
            <RiskGauge value={risk.probability} label="Cyclone Probability" level={risk.level} className="scale-125" />
          </Card>
        </motion.div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Wind Intensity</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={windData} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 200]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="font-mono text-2xl font-bold -mt-4">{risk.windSpeed} <span className="text-sm text-muted-foreground">km/h</span></p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {params.map((p) => (
            <Card key={p.label}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-lg bg-primary/10 p-2 mb-2">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground">{p.label}</p>
                <p className="font-mono text-sm font-bold mt-0.5">{p.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wind Distribution & Pressure Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Wind Speed Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={windDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "km/h", position: "insideBottomRight", offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="frequency" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} name="Frequency %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pressure Drop Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={pressureDropTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} name="Pressure (hPa)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Cyclone Risk Probabilities</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={tooltipStyle} 
                formatter={(value, name) => [`${value}%`, name]} 
                labelFormatter={(label) => `${label} (${getMonsoonType(label as string)})`}
              />
              <Bar dataKey="cycloneProb" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} name="Cyclone Risk" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
