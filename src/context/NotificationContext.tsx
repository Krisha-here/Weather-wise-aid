import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetchRiskScore } from "@/lib/api";
import { useDateContext } from "./DateContext";
import { toast } from "sonner";

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedDate } = useDateContext();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("weather_wise_notifications_enabled") === "true";
  });
  
  const lastScoreRef = useRef<number | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weather_wise_notifications_enabled", enabled.toString());
  }, [enabled]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser does not support desktop notifications.");
      return;
    }

    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === "granted") {
      toast.success("Desktop notifications enabled!");
      setEnabled(true);
    } else {
      toast.error("Notification permission denied.");
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (enabled && permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        ...options,
      });
    }
  };

  // Spike detection logic (simulated/polling-based)
  useEffect(() => {
    if (!enabled || permission !== "granted") return;

    const checkSpikes = async () => {
      try {
        const data = await fetchRiskScore(selectedDate);
        const currentScore = data.riskScore.overall;

        if (lastScoreRef.current !== null) {
          const diff = currentScore - lastScoreRef.current;
          // Threshold for "spike" - e.g. 0.3 (30% jump)
          if (diff >= 0.3) {
            sendNotification("🚨 Critical Risk Spike Detected!", {
              body: `Risk level in Nagapattinam jumped to ${(currentScore * 100).toFixed(0)}%. Take immediate precautions.`,
              tag: "risk-spike",
            });
            toast.warning("DANGER: Significant risk spike detected!", {
              description: `Risk increased by ${(diff * 100).toFixed(0)}%`,
              duration: 10000,
            });
          }
        }
        lastScoreRef.current = currentScore;
      } catch (e) {
        console.error("Failed to check for risk spikes:", e);
      }
    };

    // Poll every 30 seconds for simulation purposes
    const interval = setInterval(checkSpikes, 30000);
    checkSpikes(); // Initial check

    return () => clearInterval(interval);
  }, [enabled, permission, selectedDate]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission, sendNotification, enabled, setEnabled }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
