import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface EmergencyAlarmProps {
  trigger: boolean;
  onClose: () => void;
}

export function EmergencyAlarm({ trigger, onClose }: EmergencyAlarmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (trigger) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
        audioRef.current.loop = true;
      }
      // Browsers require user interaction before playing audio, 
      // but since they clicked "Test Alert" or interacted with the app, it usually resolves.
      audioRef.current.play().catch(e => console.error('Audio playback failed:', e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/90 backdrop-blur-sm p-4">
      {/* Background flashing effect */}
      <div className="absolute inset-0 animate-pulse bg-red-500/30 pointer-events-none" style={{ animationDuration: '0.5s' }} />
      
      <div className="bg-red-600 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-xl w-full text-center border-4 border-red-400 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <AlertTriangle className="w-24 h-24 sm:w-32 sm:h-32 mx-auto text-white animate-bounce mb-6" style={{ animationDuration: '1s' }} />
        
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider mb-4">
          Emergency Alert
        </h1>
        
        <p className="text-red-100 text-lg sm:text-xl font-medium mb-10 leading-relaxed shadow-sm">
          A critical system alert has been detected! Please check the dashboard and take immediate action.
        </p>
        
        <button 
          onClick={onClose}
          className="bg-white text-red-600 hover:bg-red-50 font-black px-8 py-4 sm:px-12 sm:py-5 rounded-full shadow-xl transition-all active:scale-95 text-xl flex items-center justify-center gap-3 mx-auto uppercase tracking-wide border-2 border-white focus:outline-none focus:ring-4 focus:ring-white/50"
        >
          <X className="w-8 h-8" />
          Mute Alarm
        </button>
      </div>
    </div>
  );
}
