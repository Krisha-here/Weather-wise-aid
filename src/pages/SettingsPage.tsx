import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Moon, Sun, Globe, Shield, AlertCircle, Palette, Zap, CheckCircle2, Send, Info } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission, enabled, setEnabled, sendNotification } = useNotifications();
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem("coastal_telegram_chat_id") || "");

  const saveTelegramId = (id: string) => {
    setTelegramChatId(id);
    localStorage.setItem("coastal_telegram_chat_id", id);
    toast.success("Telegram Chat ID saved locally.");
  };

  const testTelegram = async () => {
    if (!telegramChatId) {
       toast.error("Please enter a Chat ID first.");
       return;
    }
    toast.info("Sending test alert...");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "hai wellcome user to costal predition ai \\n\\nSYSTEM TEST: Telegram alert connection verified. ✅",
          telegram_chat_id: telegramChatId
        })
      });
      if (response.ok) toast.success("Test alert sent to your phone!");
      else toast.error("Failed to send test alert.");
    } catch (e) {
      toast.error("Network error.");
    }
  };

  const handleToggleNotifications = (val: boolean) => {
    if (val && permission !== "granted") {
      requestPermission();
    } else {
      setEnabled(val);
    }
  };

  const testNotify = () => {
    sendNotification("Weather-Wise Aid: Test Alert", {
      body: "This is a test notification. Real alerts will trigger during risk spikes!",
      icon: "/favicon.ico"
    });
    toast.info("Test notification sent!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Dashboard Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Appearance</CardTitle>
            </div>
            <CardDescription>Customize the visual style of your humanitarian dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme Mode</Label>
                <p className="text-xs text-muted-foreground">Choose between light, dark, or system default.</p>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <Button 
                  variant={theme === "light" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setTheme("light")}
                  className="h-8 gap-2 text-xs"
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </Button>
                <Button 
                  variant={theme === "dark" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setTheme("dark")}
                  className="h-8 gap-2 text-xs"
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Notifications */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Real-time Mobile Alerts</CardTitle>
            </div>
            <CardDescription>Stay updated with instant Telegram notifications for critical risk spikes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Telegram Alerts</Label>
                  <p className="text-[11px] text-muted-foreground">Receive real-time mobile notifications via our bot.</p>
                </div>
              </div>
              
              <div className="space-y-3 p-3 bg-accent/20 rounded-lg border border-border/50">
                 <div className="flex items-start gap-2.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 text-primary" />
                    <div className="text-[10px] text-muted-foreground leading-relaxed">
                       <p>If you want real-time alerts, join our telegram bot: 
                         <a href="https://t.me/Coastel_prediction_ai_bot" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline ml-1">
                           @Coastel_prediction_ai_bot
                         </a>
                       </p>
                       <p className="mt-1">1. Message <strong>@userinfobot</strong> to get your personal <strong>Chat ID</strong>.</p>
                       <p>2. Paste the ID below and save to link your phone.</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Input 
                      placeholder="Enter Telegram Chat ID" 
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button size="sm" className="h-9 px-4 text-xs" onClick={() => saveTelegramId(telegramChatId)}>Save</Button>
                 </div>
                 <Button 
                    variant="outline" 
                    className="w-full h-9 text-[10px] flex items-center justify-center gap-2 hover:bg-accent transition-colors"
                    onClick={testTelegram}
                 >
                    <Send className="h-3 w-3" />
                    Test Phone Connection
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">System & Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Refresh Interval</Label>
                <p className="text-xs text-muted-foreground">How often the AI model fetches new weather data.</p>
              </div>
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger className="w-32 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Regional Support</span>
              </div>
              <span className="text-xs font-semibold">Nagapattinam, TN (English)</span>
            </div>
            
            <div className="pt-2">
               <p className="text-[10px] text-muted-foreground/60 font-mono text-center">
                 Coastal Prediction AI v2.0 • Powered by Gemini Flash 1.5 • All data processed locally.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
