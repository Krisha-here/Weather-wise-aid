import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import { fetchRiskScore, fetchHistorical, getMonsoonType, type HistoricalPoint } from "@/lib/api";
import { type FloodRisk, type RainfallForecast, getRainfallForecast } from "@/lib/modelData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskGauge } from "@/components/RiskGauge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Droplets, Waves, TreePine, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: 12,
};

export default function FloodPredictionPage() {
  const { selectedDate } = useDateContext();
  const [flood, setFlood] = useState<FloodRisk | null>(null);
  const [rainfall, setRainfall] = useState<RainfallForecast[]>([]);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);

  useEffect(() => {
    fetchRiskScore(selectedDate).then((d) => {
      setFlood(d.flood);
    });
    setRainfall(getRainfallForecast(selectedDate));
    fetchHistorical().then(setHistorical);
  }, [selectedDate]);

  if (!flood) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const params = [
    { icon: Droplets, label: "Accumulated Rainfall", value: `${rainfall.reduce((s, r) => s + r.predicted, 0).toFixed(0)} mm`, sub: "7-day total" },
    { icon: Waves, label: "River Water Level", value: `${flood.riverWaterLevel} m`, sub: flood.riverWaterLevel > 6 ? "Critical" : "Normal" },
    { icon: TreePine, label: "Soil Moisture", value: `${flood.soilMoisture}%`, sub: flood.soilMoisture > 80 ? "Saturated" : "Absorbing" },
    { icon: ArrowDown, label: "Drainage Capacity", value: `${flood.drainageCapacity}%`, sub: flood.drainageCapacity < 50 ? "Low" : "Adequate" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Flood Risk Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1">AI model risk assessment — API driven</p>
        </div>
        <RiskBadge level={flood.level} className="text-sm px-4 py-1.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-1">
          <Card className="h-full flex flex-col items-center justify-center py-8">
            <RiskGauge value={flood.probability} label="Flood Probability" level={flood.level} className="scale-125" />
            <p className="mt-4 text-xs text-muted-foreground">Risk Level: <span className="font-semibold text-foreground">{flood.level}</span></p>
          </Card>
        </motion.div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {params.map((p) => (
            <Card key={p.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <p.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                </div>
                <p className="font-mono text-xl font-bold">{p.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Rainfall Accumulation (7-Day)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rainfall}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="predicted" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Rainfall (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Flood Risk Probabilities</CardTitle></CardHeader>
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
              <Bar dataKey="floodProb" fill="hsl(var(--warning))" radius={[3, 3, 0, 0]} name="Flood Risk" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
