import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DateProvider } from "@/context/DateContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import RainfallForecastPage from "@/pages/RainfallForecastPage";
import FloodPredictionPage from "@/pages/FloodPredictionPage";
import CyclonePredictionPage from "@/pages/CyclonePredictionPage";
import AlertsPage from "@/pages/AlertsPage";
import ChatbotPage from "@/pages/ChatbotPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";
import { NotificationProvider } from "@/context/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="coastal-prediction-theme">
        <DateProvider>
          <AuthProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/rainfall-forecast" element={<RainfallForecastPage />} />
                    <Route path="/flood-prediction" element={<FloodPredictionPage />} />
                    <Route path="/cyclone-prediction" element={<CyclonePredictionPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </DateProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
