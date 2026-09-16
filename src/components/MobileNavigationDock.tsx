import React from 'react';
import { 
  Bot, 
  Calendar, 
  FileText, 
  Home, 
  Sparkles, 
  FolderKanban, 
  Mic, 
  MicOff,
  Radio
} from 'lucide-react';
import { SystemView } from '../types';
import { playChirp } from '../utils/soundEffects';

interface MobileNavigationDockProps {
  currentView: SystemView;
  onViewChange: (view: SystemView) => void;
  isListening: boolean;
  onToggleVoiceMic: () => void;
  pendingTasksCount?: number;
  devicesCount?: number;
  radarAlertsCount?: number;
}

export const MobileNavigationDock: React.FC<MobileNavigationDockProps> = ({
  currentView,
  onViewChange,
  isListening,
  onToggleVoiceMic,
  pendingTasksCount = 0,
  devicesCount = 0,
  radarAlertsCount = 0
}) => {
  const navItems: { id: SystemView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'hud', label: 'Asistan', icon: <Bot className="w-5 h-5" /> },
    { id: 'radar', label: 'Gündem', icon: <Radio className="w-5 h-5" />, badge: radarAlertsCount },
    { id: 'planner', label: 'Ajanda', icon: <Calendar className="w-5 h-5" />, badge: pendingTasksCount },
    { id: 'notes', label: 'Notlar', icon: <FileText className="w-5 h-5" /> },
    { id: 'smarthome', label: 'Ev', icon: <Home className="w-5 h-5" />, badge: devicesCount },
    { id: 'tools', label: 'Araçlar', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <nav 
      id="mobile-navigation-dock" 
      className="bg-[#051124]/95 backdrop-blur-xl border-t border-cyan-500/30 px-2 py-1.5 flex items-center justify-around z-40 relative select-none"
    >
      {/* Voice Assistant Push-To-Talk Floating Pulse Button */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <button
          onClick={() => {
            playChirp(isListening ? 700 : 1300);
            onToggleVoiceMic();
          }}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg border-2 ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.8)] scale-110'
              : 'bg-gradient-to-tr from-cyan-600 to-cyan-400 border-cyan-200 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:scale-105'
          }`}
          title={isListening ? 'Dinlemeyi Durdur' : 'J.A.R.V.I.S. ile Konuş (Bas-Konuş)'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Left side items */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        {navItems.slice(0, 3).map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playChirp(1000);
                onViewChange(item.id);
              }}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all relative ${
                isActive 
                  ? 'text-cyan-300 font-bold' 
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {item.icon}
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer for center Mic */}
      <div className="w-14" />

      {/* Right side items */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        {navItems.slice(3).map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playChirp(1000);
                onViewChange(item.id);
              }}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all relative ${
                isActive 
                  ? 'text-cyan-300 font-bold' 
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {item.icon}
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
