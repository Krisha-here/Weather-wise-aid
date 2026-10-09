// Model-driven dummy data generator based on date selection
// All data is "from the model" — no manual entry

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  condition: string;
}

export interface RainfallForecast {
  day: string;
  date: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

export interface FloodRisk {
  level: "Low" | "Medium" | "High";
  probability: number;
  riverWaterLevel: number;
  soilMoisture: number;
  drainageCapacity: number;
}

export interface CycloneRisk {
  level: "Low" | "Medium" | "High";
  probability: number;
  windSpeed: number;
  pressure: number;
  seaSurfaceTemp: number;
  category: string;
}

export interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  message: string;
  timestamp: string;
}

export interface HistoricalPoint {
  month: string;
  rainfall: number;
  floods: number;
  cyclones: number;
}

// Seeded random based on date string
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

export function getWeatherData(date: Date): WeatherData {
  const rand = seededRandom(date.toISOString().slice(0, 10));
  const month = date.getMonth();
  const isMonsoon = month >= 5 && month <= 9;
  
  return {
    temperature: Math.round(22 + rand() * 16),
    humidity: Math.round(isMonsoon ? 70 + rand() * 25 : 40 + rand() * 30),
    windSpeed: Math.round(5 + rand() * (isMonsoon ? 45 : 20)),
    pressure: Math.round(990 + rand() * 30),
    rainfall: Math.round((isMonsoon ? 20 + rand() * 180 : rand() * 30) * 10) / 10,
    condition: isMonsoon ? (rand() > 0.3 ? "Rainy" : "Cloudy") : (rand() > 0.6 ? "Cloudy" : "Clear"),
  };
}

export function getRainfallForecast(baseDate: Date): RainfallForecast[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const rand = seededRandom(d.toISOString().slice(0, 10) + "rain");
    const month = d.getMonth();
    const isMonsoon = month >= 5 && month <= 9;
    const predicted = Math.round((isMonsoon ? 30 + rand() * 150 : rand() * 40) * 10) / 10;
    return {
      day: days[d.getDay()],
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      predicted,
      actual: i === 0 ? Math.round(predicted * (0.8 + rand() * 0.4) * 10) / 10 : undefined,
      confidence: Math.round((75 + rand() * 20) * 10) / 10,
    };
  });
}

export function getFloodRisk(date: Date): FloodRisk {
  const rand = seededRandom(date.toISOString().slice(0, 10) + "flood");
  const month = date.getMonth();
  const isMonsoon = month >= 5 && month <= 9;
  const probability = Math.round((isMonsoon ? 30 + rand() * 60 : rand() * 25) * 10) / 10;
  
  return {
    level: probability > 60 ? "High" : probability > 35 ? "Medium" : "Low",
    probability,
    riverWaterLevel: Math.round((isMonsoon ? 3 + rand() * 7 : 1 + rand() * 3) * 10) / 10,
    soilMoisture: Math.round((isMonsoon ? 60 + rand() * 35 : 20 + rand() * 40) * 10) / 10,
    drainageCapacity: Math.round((40 + rand() * 50) * 10) / 10,
  };
}

export function getCycloneRisk(date: Date): CycloneRisk {
  const rand = seededRandom(date.toISOString().slice(0, 10) + "cyclone");
  const month = date.getMonth();
  const isCycloneSeason = (month >= 4 && month <= 6) || (month >= 9 && month <= 11);
  const probability = Math.round((isCycloneSeason ? 20 + rand() * 60 : rand() * 15) * 10) / 10;
  const windSpeed = Math.round(isCycloneSeason ? 40 + rand() * 120 : 10 + rand() * 30);

  let category = "None";
  if (windSpeed > 120) category = "Category 4";
  else if (windSpeed > 90) category = "Category 3";
  else if (windSpeed > 60) category = "Category 2";
  else if (windSpeed > 40) category = "Category 1";

  return {
    level: probability > 55 ? "High" : probability > 30 ? "Medium" : "Low",
    probability,
    windSpeed,
    pressure: Math.round(980 + rand() * 40),
    seaSurfaceTemp: Math.round((26 + rand() * 5) * 10) / 10,
    category,
  };
}

export function getAlerts(date: Date): Alert[] {
  const weather = getWeatherData(date);
  const flood = getFloodRisk(date);
  const cyclone = getCycloneRisk(date);
  const alerts: Alert[] = [];
  const ts = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (weather.rainfall > 100) {
    alerts.push({ id: "1", type: "danger", message: `Heavy rainfall detected: ${weather.rainfall}mm`, timestamp: ts });
  } else if (weather.rainfall > 50) {
    alerts.push({ id: "2", type: "warning", message: `Moderate rainfall: ${weather.rainfall}mm`, timestamp: ts });
  }
  if (flood.level === "High") {
    alerts.push({ id: "3", type: "danger", message: `Flood risk HIGH — probability ${flood.probability}%`, timestamp: ts });
  } else if (flood.level === "Medium") {
    alerts.push({ id: "4", type: "warning", message: `Flood risk elevated — probability ${flood.probability}%`, timestamp: ts });
  }
  if (cyclone.level === "High") {
    alerts.push({ id: "5", type: "danger", message: `Cyclone risk HIGH — ${cyclone.category}, wind ${cyclone.windSpeed} km/h`, timestamp: ts });
  } else if (cyclone.level === "Medium") {
    alerts.push({ id: "6", type: "warning", message: `Cyclone activity detected — probability ${cyclone.probability}%`, timestamp: ts });
  }
  if (alerts.length === 0) {
    alerts.push({ id: "7", type: "info", message: "All systems normal — no active warnings", timestamp: ts });
  }
  return alerts;
}

export function getHistoricalData(): HistoricalPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => {
    const rand = seededRandom(month + "hist");
    const isMonsoon = i >= 5 && i <= 9;
    return {
      month,
      rainfall: Math.round(isMonsoon ? 150 + rand() * 250 : 20 + rand() * 60),
      floods: Math.round(isMonsoon ? rand() * 5 : rand() * 1),
      cyclones: (i >= 4 && i <= 6) || (i >= 9 && i <= 11) ? Math.round(rand() * 3) : 0,
    };
  });
}

export function getHourlyRainfall(date: Date): { hour: string; rainfall: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const rand = seededRandom(date.toISOString().slice(0, 10) + "h" + i);
    const month = date.getMonth();
    const isMonsoon = month >= 5 && month <= 9;
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      rainfall: Math.round((isMonsoon ? rand() * 25 : rand() * 8) * 10) / 10,
    };
  });
}
