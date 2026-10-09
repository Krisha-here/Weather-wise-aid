import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import {
  fetchRiskScore,
  fetchCycloneAnalysis,
  fetchRainfallForecast,
  fetchHistorical,
  type RiskScore,
} from "@/lib/api";
import { type FloodRisk, type HistoricalPoint, type RainfallForecast } from "@/lib/modelData";
import { type CycloneRisk } from "@/lib/modelData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, Download, Users, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ReportDialog, type CommunityReport } from "@/components/ReportDialog";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: 12,
};

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const { selectedDate } = useDateContext();
  const [flood, setFlood] = useState<FloodRisk | null>(null);
  const [cyclone, setCyclone] = useState<CycloneRisk | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [rainfall, setRainfall] = useState<RainfallForecast[]>([]);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);

  useEffect(() => {
    fetchRiskScore(selectedDate).then((d) => {
      setFlood(d.flood);
      setRiskScore(d.riskScore);
    });
    fetchCycloneAnalysis(selectedDate).then((d) => setCyclone(d.risk));
    fetchRainfallForecast(selectedDate).then((d) => setRainfall(d.forecast));
    fetchHistorical().then(setHistorical);

    // Names for diversification
    const randomNames = ["Coast Guardian", "Wave Watcher", "Storm Chaser", "Delta Resident", "Night Sentinel", "Beach Marshall", "Flood Scout"];
    const getRandomName = () => randomNames[Math.floor(Math.random() * randomNames.length)];

    // Load community reports
    const saved = localStorage.getItem("weather_wise_community_reports");
    if (saved) {
      setCommunityReports(JSON.parse(saved));
    } else {
      // Mock some initial reports with random names
      const initial = [
        { id: "1", user: getRandomName(), category: "rainfall", location: "District HQ", description: "Heavy rains observed since morning. No drainage blockage yet.", timestamp: new Date().toISOString() },
        { id: "2", user: getRandomName(), category: "flood", location: "Vedaranyam Road", description: "Slight water logging reported near the junction.", timestamp: new Date().toISOString() },
        { id: "3", user: getRandomName(), category: "cyclone", location: "Karaikal Border", description: "Winds are picking up speed. Coastal trees are swaying heavily.", timestamp: new Date().toISOString() }
      ];
      setCommunityReports(initial);
      localStorage.setItem("weather_wise_community_reports", JSON.stringify(initial));
    }
  }, [selectedDate]);

  const handleNewReport = (report: CommunityReport) => {
    const updated = [report, ...communityReports];
    setCommunityReports(updated);
    localStorage.setItem("weather_wise_community_reports", JSON.stringify(updated));
  };

  if (!flood || !cyclone || !riskScore) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const totalRain = rainfall.reduce((s, r) => s + r.predicted, 0).toFixed(0);
  const isEventReport = riskScore.overall > 80;
  const dateStr = selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const mapClassificationToLevel = (classification: string): "Low" | "Medium" | "High" => {
    if (classification === "EXTREME" || classification === "VERY HIGH") return "High";
    if (classification === "HIGH" || classification === "ELEVATED") return "Medium";
    return "Low";
  };

  function handleExportPDF(type: "daily" | "event") {
    // Simulate PDF generation 
    const content = type === "daily"
      ? `DAILY SITUATION REPORT\n${dateStr}\n\nRainfall: ${totalRain}mm (7-day total)\nFlood Risk: ${flood!.level} (${flood!.probability}%)\nCyclone Risk: ${cyclone!.level} (${cyclone!.probability}%)\nOverall Risk: ${riskScore!.classification} (${riskScore!.overall})\n\nAlert Summary:\n- Risk classification: ${riskScore!.classification}\n- Flood probability: ${flood!.probability}%\n- Cyclone category: ${cyclone!.category}`
      : `EVENT REPORT\n${dateStr}\n\nRisk Score: ${riskScore!.overall} (${riskScore!.classification})\n\nRainfall Conditions:\n- 7-day total: ${totalRain}mm\n- Extreme rainfall: ${Number(totalRain) > 500 ? "Detected" : "Not detected"}\n\nCyclone Conditions:\n- Category: ${cyclone!.category}\n- Wind: ${cyclone!.windSpeed} km/h\n- Pressure: ${cyclone!.pressure} hPa\n\nFlood Assessment:\n- Level: ${flood!.level}\n- Probability: ${flood!.probability}%\n- River Level: ${flood!.riverWaterLevel}m`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${selectedDate.toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Reports & Insights</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAuthenticated && (
             <ReportDialog onReportSubmit={handleNewReport} />
          )}
          <Button variant="outline" size="sm" onClick={() => handleExportPDF("daily")}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Daily PDF
          </Button>
          {isEventReport && (
            <Button variant="destructive" size="sm" onClick={() => handleExportPDF("event")}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Event PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AI Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                         <p className="text-4xl font-bold font-mono">{(riskScore.overall * 100).toFixed(0)}%</p>
                         <p className="text-sm font-semibold mt-1 text-primary">{riskScore.classification}</p>
                    </div>
                    <RiskBadge level={mapClassificationToLevel(riskScore.classification)} />
                  </div>
                </CardContent>
             </Card>
             <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Precipitation Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-4xl font-bold font-mono">{totalRain}<span className="text-sm text-muted-foreground ml-1">mm</span></p>
                   <p className="text-xs text-muted-foreground mt-1">Accumulated rainfall over 7 days</p>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Regional Historical Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historical}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="rainfall" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Rainfall" />
                  <Bar dataKey="floods" fill="hsl(var(--warning))" radius={[3, 3, 0, 0]} name="Floods" />
                  <Bar dataKey="cyclones" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} name="Cyclones" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Community Reports Feed */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-tight">Live Community Feed</h2>
           </div>
           <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
              {communityReports.map((report) => (
                <Card key={report.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                        {report.category}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-xs leading-relaxed mt-1">{report.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </div>
                    <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
                       <span className="text-[10px] font-semibold">By: {report.user}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {communityReports.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-lg">
                  No community reports yet. Be the first!
                </p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

