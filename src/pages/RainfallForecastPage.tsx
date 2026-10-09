import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import { fetchRainfallForecast, fetchHistorical, getMonsoonType, type RollingStats, type HistoricalPoint } from "@/lib/api";
import { type RainfallForecast } from "@/lib/modelData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: 12,
};

export default function RainfallForecastPage() {
  const { selectedDate } = useDateContext();
  const [forecast, setForecast] = useState<RainfallForecast[]>([]);
  const [stats, setStats] = useState<RollingStats | null>(null);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);

  useEffect(() => {
    fetchRainfallForecast(selectedDate).then((data) => {
      setForecast(data.forecast);
      setStats(data.rollingStats);
    });
    fetchHistorical().then(setHistorical);
  }, [selectedDate]);

  const avgConfidence = forecast.length ? (forecast.reduce((s, f) => s + f.confidence, 0) / forecast.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Rainfall Forecast Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI model predictions • Avg confidence: <span className="font-mono font-bold text-primary">{avgConfidence}%</span>
        </p>
      </div>

      {/* Rolling Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">7-Day Rolling Mean</p>
              <p className="font-mono text-xl font-bold">{stats.mean7d}<span className="text-xs text-muted-foreground"> mm</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-4 w-4 text-secondary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">30-Day Rolling Mean</p>
              <p className="font-mono text-xl font-bold">{stats.mean30d}<span className="text-xs text-muted-foreground"> mm</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CloudRain className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Max Daily</p>
              <p className="font-mono text-xl font-bold">{stats.maxDaily}<span className="text-xs text-muted-foreground"> mm</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CloudRain className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Total Accumulated</p>
              <p className="font-mono text-xl font-bold">{stats.totalAccumulated}<span className="text-xs text-muted-foreground"> mm</span></p>
            </CardContent>
          </Card>
          <Card className={stats.extremeDetected ? "border-destructive/50" : ""}>
            <CardContent className="p-4 text-center">
              <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${stats.extremeDetected ? "text-destructive" : "text-muted-foreground"}`} />
              <p className="text-[10px] text-muted-foreground">Extreme Detection</p>
              <p className={`font-mono text-sm font-bold ${stats.extremeDetected ? "text-destructive" : "text-success"}`}>
                {stats.extremeDetected ? "DETECTED" : "NONE"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecast cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {forecast.map((f, i) => (
          <motion.div key={f.date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={i === 0 ? "border-primary/30" : ""}>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{f.day}</p>
                <p className="text-xs font-medium">{f.date}</p>
                <p className="font-mono text-lg font-bold mt-1">{f.predicted}<span className="text-[10px] text-muted-foreground"> mm</span></p>
                {f.actual !== undefined && (
                  <p className="text-[10px] text-success mt-0.5">Actual: {f.actual} mm</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.confidence}%</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">7-Day Forecast</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" fill="url(#rainGrad)" strokeWidth={2} name="Predicted (mm)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Forecast Confidence</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="confidence" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Rainfall Risk Probabilities</CardTitle></CardHeader>
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
              <Bar dataKey="rainfallProb" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Rainfall Risk" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
