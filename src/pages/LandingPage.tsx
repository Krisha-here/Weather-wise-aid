import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Waves, Wind, CloudRain, Activity } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 text-center max-w-2xl"
      >
        <div className="mb-8 relative inline-block">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 shadow-2xl flex items-center justify-center overflow-hidden"
          >
            <Activity className="w-full h-full text-primary" strokeWidth={2.5} />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 bg-primary p-1.5 rounded-full shadow-lg"
          >
            <Shield className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Coastal <span className="text-primary italic">Prediction</span> AI
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
            An Advanced Multi-Agentic AI Framework for Disaster Risk Assessment and Decision Support.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <Button
            size="lg"
            className="w-full sm:w-40 h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-40 h-14 text-base font-semibold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all shadow-xl"
            onClick={() => navigate("/signup")}
          >
            Register
          </Button>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-10"
        >
          <div className="flex flex-col items-center gap-2">
            <Waves className="w-6 h-6 text-primary" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Flood Agent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Wind className="w-6 h-6 text-primary" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Cyclone Agent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloudRain className="w-6 h-6 text-primary" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Rainfall Agent</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Credits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 text-[10px] text-white uppercase tracking-[0.3em] font-medium"
      >
        Coastal Prediction AI System — Multi-Agentic Framework v2.0
      </motion.div>
    </div>
  );
}
