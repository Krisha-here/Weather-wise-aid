import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Home,
  CloudRain,
  Waves,
  Wind,
  Shield,
  MessageSquare,
  FileText,
  Settings,
  User,
  Activity,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalDatePicker } from "@/components/GlobalDatePicker";
import { useDateContext } from "@/context/DateContext";
import { getAlerts } from "@/lib/modelData";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/rainfall-forecast", label: "Rainfall", icon: CloudRain },
  { to: "/flood-prediction", label: "Flood", icon: Waves },
  { to: "/cyclone-prediction", label: "Cyclone", icon: Wind },
  { to: "/alerts", label: "Alerts", icon: Shield },
  { to: "/chatbot", label: "Chatbot", icon: MessageSquare },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const { selectedDate } = useDateContext();

  const handleTestTelegram = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/test-telegram");
      const data = await res.json();
      if (data.success) {
        alert("Alert Sent! Check your Telegram app.");
      } else {
        alert("Error: " + data.error + "\nMake sure you message your bot first!");
      }
    } catch (err: any) {
      alert("Failed to connect to backend API.");
    }
  };
  const alerts = getAlerts(selectedDate);
  const dangerCount = alerts.filter((a) => a.type === "danger").length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sidebar-foreground text-sm">
            Coastal Prediction AI
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/50 font-mono">v1.0.0 • Model Predictions</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3 md:hidden">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Coastal Prediction AI</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Model Date:</span>
            <GlobalDatePicker />
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <GlobalDatePicker />
            </div>
            <button 
              onClick={handleTestTelegram}
              title="Test Telegram Alert"
              className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground flex items-center gap-2 text-xs"
            >
              <Send className="h-4 w-4" />
              <span className="hidden md:inline">Test Alert</span>
            </button>
            <Link to="/login" className="p-2 rounded-md hover:bg-accent transition-colors">
              <User className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto border-b border-border bg-card px-2 py-1 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
