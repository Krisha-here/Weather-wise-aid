export interface RiskScore {
  overall: number;
  classification: "NORMAL" | "ELEVATED" | "HIGH" | "VERY HIGH" | "EXTREME";
  rainfall: number;
  flood: number;
  cyclone: number;
}

export interface RollingStats {
  mean7d: number;
  mean30d: number;
  extremeDetected: boolean;
  maxDaily: number;
  totalAccumulated: number;
}

export interface CompoundHazard {
  detected: boolean;
  score: number;
  factors: string[];
  calendar: { date: string; hazardLevel: number }[];
}

export interface CycloneAnalysis {
  risk: any; // Using any for simplicity here
  intensificationProbability: number;
  gradeEscalation: string;
  windDistribution: { range: string; frequency: number }[];
  pressureDropTrend: { hour: string; pressure: number }[];
  severityScore: number;
}

export interface AlertEntry {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  alertType: string;
  message: string;
  recommendedAction: string;
}

export interface ChatbotContext {
  current_risk_level: string;
  risk_score: number;
  active_alerts: string[];
  cyclone_active: boolean;
  rainfall_forecast_7d: number[];
  emergency_contacts: { name: string; phone: string }[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rainfall: number;
  soilMoisture: number;
  elevation: number;
  drainageCapacity: number;
  condition: string;
}

export interface HistoricalPoint {
  month: string;
  rainfall: number;
  floods: number;
  cyclones: number;
  rainfallProb: number;
  floodProb: number;
  cycloneProb: number;
}

const BASE = 'http://127.0.0.1:8000';
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export async function fetchWeather(date: Date): Promise<WeatherData> {
  const r = await fetch(`${BASE}/api/weather?date=${fmt(date)}`);
  return r.json();
}

export async function fetchRainfallForecast(date: Date) {
  const r = await fetch(`${BASE}/api/rainfall-forecast?date=${fmt(date)}`);
  return r.json();
}

export async function fetchRiskScore(date: Date) {
  const r = await fetch(`${BASE}/api/risk-score?date=${fmt(date)}`);
  return r.json();
}

export async function fetchCycloneAnalysis(date: Date) {
  const r = await fetch(`${BASE}/api/cyclone-analysis?date=${fmt(date)}`);
  return r.json();
}

export async function fetchAlerts(date: Date) {
  const r = await fetch(`${BASE}/api/alerts?date=${fmt(date)}`);
  return r.json();
}

export async function fetchChatbotContext(date: Date) {
  const r = await fetch(`${BASE}/api/chatbot-context?date=${fmt(date)}`);
  return r.json();
}

export async function fetchSoilMoisture() {
  const r = await fetch(`${BASE}/api/soil-moisture`);
  return r.json();
}

export async function fetchHistorical(): Promise<HistoricalPoint[]> {
  const r = await fetch(`${BASE}/api/historical`);
  return r.json();
}

export function getMonsoonType(month: string): string {
  const m = month.substring(0, 3);
  const sw = ['Jun', 'Jul', 'Aug', 'Sep'];
  const ne = ['Oct', 'Nov', 'Dec'];
  if (sw.includes(m)) return "SW Monsoon";
  if (ne.includes(m)) return "NE Monsoon";
  return "No Monsoon";
}
