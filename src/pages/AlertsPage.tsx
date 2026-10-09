import { useEffect, useState } from "react";
import { useDateContext } from "@/context/DateContext";
import { fetchAlerts, fetchRiskScore, type AlertEntry, type RiskScore } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, Shield, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

export default function AlertsPage() {
  const { selectedDate } = useDateContext();
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checklist state
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem("disaster_readiness_checklist");
    return saved ? JSON.parse(saved) : {
      documents: false,
      appliances: false,
      community: false,
    };
  });

  useEffect(() => {
    localStorage.setItem("disaster_readiness_checklist", JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAlerts(selectedDate),
      fetchRiskScore(selectedDate)
    ]).then(([alertData, riskData]) => {
      setAlerts(alertData);
      setRiskScore(riskData.riskScore);
      setLoading(false);
    });
  }, [selectedDate]);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const isHighRisk = criticalCount > 0 || warningCount > 0 || (riskScore && riskScore.overall > 0.6);

  const severityIcon = (s: AlertEntry["severity"]) => {
    if (s === "critical") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (s === "warning") return <AlertCircle className="h-4 w-4 text-warning" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const severityBg = (s: AlertEntry["severity"]) => {
    if (s === "critical") return "bg-destructive/5 border-l-4 border-l-destructive";
    if (s === "warning") return "bg-warning/5 border-l-4 border-l-warning";
    return "bg-muted/50 border-l-4 border-l-muted-foreground/30";
  };

  const toggleCheck = (id: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Alerts & Preparedness</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Critical</p>
                  <p className="font-mono text-2xl font-bold">{criticalCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Warnings</p>
                  <p className="font-mono text-2xl font-bold">{warningCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total</p>
                  <p className="font-mono text-2xl font-bold">{alerts.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Alert Log</CardTitle>
              <CardDescription className="text-[10px]">Real-time monitoring for Nagapattinam Coast</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading alerts...</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-md p-4 transition-all hover:bg-muted/5 ${severityBg(alert.severity)}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{severityIcon(alert.severity)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              alert.severity === "critical" ? "bg-destructive/10 text-destructive" :
                              alert.severity === "warning" ? "bg-warning/10 text-warning-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {alert.severity}
                            </span>
                            <span className="text-sm font-semibold text-foreground">{alert.alertType}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{alert.timestamp}</span>
                          </div>
                          <p className="text-sm mt-2 leading-relaxed">{alert.message}</p>
                          <div className="mt-3 flex items-center gap-2">
                             <div className="h-1 w-1 rounded-full bg-primary" />
                             <p className="text-[11px] text-primary font-medium">
                               <span className="uppercase text-[9px] mr-1 opacity-70">Action Required:</span> {alert.recommendedAction}
                             </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-10">
                        <Shield className="h-8 w-8 text-success mx-auto opacity-20" />
                        <p className="text-sm text-muted-foreground mt-2">No active threats detected for this period.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Readiness Guide Sidebar */}
        <AnimatePresence>
          {isHighRisk && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <Card className="border-primary/30 bg-primary/5 overflow-hidden">
                <CardHeader className="bg-primary/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary animate-pulse" />
                    <CardTitle className="text-sm">Prepare Now Guide</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] text-primary/80 font-medium">
                    Immediate actions for Nagapattinam safety
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checklist.documents ? 'bg-success/5 border-success/30' : 'bg-background hover:border-primary/50'}`}
                    onClick={() => toggleCheck('documents')}
                  >
                    <Checkbox checked={checklist.documents} className="mt-1" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${checklist.documents ? 'text-success line-through opacity-70' : ''}`}>
                        Seal important documents
                      </p>
                      <p className="text-[10px] text-muted-foreground">In waterproof bags (Aadhaar, property, etc.)</p>
                    </div>
                  </div>

                  <div 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checklist.appliances ? 'bg-success/5 border-success/30' : 'bg-background hover:border-primary/50'}`}
                    onClick={() => toggleCheck('appliances')}
                  >
                    <Checkbox checked={checklist.appliances} className="mt-1" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${checklist.appliances ? 'text-success line-through opacity-70' : ''}`}>
                        Move electrical appliances
                      </p>
                      <p className="text-[10px] text-muted-foreground">Laptops, TVs, and batteries to second floor</p>
                    </div>
                  </div>

                  <div 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checklist.community ? 'bg-success/5 border-success/30' : 'bg-background hover:border-primary/50'}`}
                    onClick={() => toggleCheck('community')}
                  >
                    <Checkbox checked={checklist.community} className="mt-1" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${checklist.community ? 'text-success line-through opacity-70' : ''}`}>
                        Monitor community feed
                      </p>
                      <p className="text-[10px] text-muted-foreground">Check reports for nearby water logging on ground</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                       <span className="font-medium text-muted-foreground">Readiness Status</span>
                       <span className="font-bold">{Object.values(checklist).filter(Boolean).length}/3 Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(Object.values(checklist).filter(Boolean).length / 3) * 100}%` }}
                       />
                    </div>
                    {Object.values(checklist).every(Boolean) && (
                      <p className="text-[10px] text-success font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Fully Prepared
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="h-4 w-4 text-warning mt-1" />
                  <div>
                    <p className="text-xs font-bold text-warning-foreground">Safety First</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      If water levels rise significantly, follow evacuation orders immediately. Do not attempt to cross flooded roads.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

