import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import {
  fetchWeather,
  fetchRainfallForecast,
  fetchRiskScore,
  fetchCycloneAnalysis,
  fetchAlerts,
  fetchHistorical,
  getMonsoonType,
  type RiskScore,
  type AlertEntry,
} from "@/lib/api";
import {
  type WeatherData,
  type RainfallForecast,
  type FloodRisk,
  type CycloneRisk,
  type HistoricalPoint,
} from "@/lib/modelData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskGauge } from "@/components/RiskGauge";
import {
  Thermometer, Droplets, Wind, Gauge, CloudRain,
  AlertTriangle, AlertCircle, Info, ShieldAlert, Sprout,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: 12,
};

function classificationColor(c: RiskScore["classification"]) {
  if (c === "EXTREME") return "text-destructive";
  if (c === "VERY HIGH") return "text-destructive";
  if (c === "HIGH") return "text-warning-foreground";
  if (c === "ELEVATED") return "text-warning-foreground";
  return "text-success";
}

export default function HomePage() {
  const { user } = useAuth();
  const { selectedDate } = useDateContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rainfall, setRainfall] = useState<RainfallForecast[]>([]);
  const [flood, setFlood] = useState<FloodRisk | null>(null);
  const [cyclone, setCyclone] = useState<CycloneRisk | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);

  useEffect(() => {
    fetchWeather(selectedDate).then(setWeather);
    fetchRainfallForecast(selectedDate).then((d) => setRainfall(d.forecast));
    fetchRiskScore(selectedDate).then((d) => {
      setFlood(d.flood);
      setRiskScore(d.riskScore);
    });
    fetchCycloneAnalysis(selectedDate).then((d) => setCyclone(d.risk));
    fetchAlerts(selectedDate).then(setAlerts);
    fetchHistorical().then(setHistorical);
  }, [selectedDate]);

  if (!weather || !flood || !cyclone || !riskScore) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading model data...</div>;
  }

  const weatherItems = [
    { icon: Thermometer, label: "Temperature", value: `${weather.temperature}°C` },
    { icon: Droplets, label: "Humidity", value: `${weather.humidity}%` },
    { icon: Wind, label: "Wind Speed", value: `${weather.windSpeed} km/h` },
    { icon: Gauge, label: "Pressure", value: `${weather.pressure} hPa` },
    { icon: CloudRain, label: "Rainfall", value: `${weather.rainfall} mm` },
    { icon: Sprout, label: "Soil Moisture", value: `${weather.soilMoisture.toFixed(0)}%` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Welcome, ${user.name} to the Dashboard Overview` : 'Dashboard Overview'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Model predictions for {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Weather Summary */}
      <motion.div {...fadeIn} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {weatherItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-mono text-lg font-bold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Risk Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rainfall Risk */}
        <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Rainfall Risk
                <span className={`text-xs font-mono font-bold ${riskScore.rainfall > 60 ? "text-destructive" : riskScore.rainfall > 30 ? "text-warning-foreground" : "text-success"}`}>
                  {riskScore.rainfall.toFixed(0)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 text-center">
              <p className="font-mono text-3xl font-bold">{weather.rainfall}<span className="text-sm text-muted-foreground"> mm</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Predicted rainfall amount</p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${riskScore.rainfall > 60 ? "bg-destructive" : riskScore.rainfall > 30 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${Math.min(riskScore.rainfall, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flood Risk */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Flood Risk <RiskBadge level={flood.level} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <RiskGauge value={flood.probability} label="Probability" level={flood.level} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Cyclone Risk */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Cyclone Risk <RiskBadge level={cyclone.level} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <RiskGauge value={cyclone.probability} label="Probability" level={cyclone.level} />
              <div className="grid grid-cols-2 gap-2 mt-3 w-full text-center">
                <div>
                  <p className="font-mono text-sm font-bold">{cyclone.windSpeed} <span className="text-[10px] text-muted-foreground">km/h</span></p>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold">{cyclone.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overall Disaster Risk */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card className="h-full border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Overall Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <div className="relative">
                <RiskGauge
                  value={riskScore.overall}
                  label="Composite Score"
                  level={riskScore.overall > 55 ? "High" : riskScore.overall > 30 ? "Medium" : "Low"}
                />
              </div>
              <p className={`font-mono text-sm font-bold mt-2 ${classificationColor(riskScore.classification)}`}>
                {riskScore.classification}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
                  alert.severity === "critical" ? "risk-high" :
                  alert.severity === "warning" ? "risk-medium" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                {alert.severity === "critical" ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                 alert.severity === "warning" ? <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                 <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="opacity-60 mt-0.5">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-sm">7-Day Rainfall Forecast</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={rainfall}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Predicted (mm)" />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} name="Actual (mm)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader><CardTitle className="text-sm">Historical Trends (Monthly)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={historical}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="rainfall" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Rainfall (mm)" />
                  <Bar dataKey="floods" fill="hsl(var(--warning))" radius={[3, 3, 0, 0]} name="Floods" />
                  <Bar dataKey="cyclones" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} name="Cyclones" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly Risk Probabilities</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={historical}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    formatter={(value, name) => [`${value}%`, name]} 
                    labelFormatter={(label) => `${label} (${getMonsoonType(label as string)})`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="rainfallProb" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Rainfall Risk" />
                  <Bar dataKey="floodProb" fill="hsl(var(--warning))" radius={[3, 3, 0, 0]} name="Flood Risk" />
                  <Bar dataKey="cycloneProb" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} name="Cyclone Risk" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
