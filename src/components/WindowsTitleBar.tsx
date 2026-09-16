import React, { useState, useEffect } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Mic, 
  FolderKanban,
  Home,
  Sparkles,
  Radio,
  MapPin
} from 'lucide-react';
import { SystemView } from '../types';
import { playChirp } from '../utils/soundEffects';

interface WindowsTitleBarProps {
  currentView: SystemView;
  onViewChange: (view: SystemView) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  onClose: () => void;
  devicesCount: number;
  locationCity?: string;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  currentView,
  onViewChange,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  isCompact,
  onToggleCompact,
  onClose,
  devicesCount,
  locationCity
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    playChirp(1400);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsMaximized(false);
    }
  };

  const navItems: { id: SystemView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'hud', label: 'J.A.R.V.I.S. Asistan', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { 
      id: 'smarthome', 
      label: 'Akıllı Ev', 
      icon: <Home className="w-4 h-4 text-emerald-400" />, 
      badge: `${devicesCount} Cihaz` 
    },
    { id: 'files', label: 'Dosya Gezgini', icon: <FolderKanban className="w-4 h-4 text-amber-400" />, badge: 'C: D: Z:' },
    { id: 'transfer', label: 'Veri Aktarımı', icon: <Radio className="w-4 h-4 text-sky-400" /> }
  ];

  return (
    <header 
      id="windows-title-bar" 
      className="h-12 bg-[#060e1c]/95 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between px-3 select-none z-50 text-xs font-mono text-cyan-200"
    >
      {/* Left: Assistant Logo & Window Branding */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping opacity-60 absolute" />
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 font-bold tracking-wider text-cyan-300 font-['Orbitron']">
            <span>J.A.R.V.I.S.</span>
            <span className="text-[10px] text-cyan-400/70 font-sans font-normal">Windows Workstation</span>
          </div>
          <div className="text-[9px] text-cyan-400/60 tracking-tight flex items-center space-x-1">
            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
            <span>{locationCity || 'Konum Tespiti Yapılıyor'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Main Navigation Tabs */}
      <nav id="jarvis-navigation-tabs" className="flex items-center space-x-1 bg-[#09152b]/80 p-1 rounded-lg border border-cyan-500/20">
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => {
                playChirp(1100);
                onViewChange(item.id);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all text-xs font-medium cursor-pointer ${
                active
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10'
              }`}
            >
              {item.icon}
              <span className="font-['Rajdhani'] font-semibold tracking-wide">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Sound / Voice Toggles & Window System Buttons */}
      <div className="flex items-center space-x-2">
        {/* Audio FX Toggle */}
        <button
          id="btn-sound-toggle"
          title={soundEnabled ? 'Ses Efektlerini Kapat' : 'Ses Efektlerini Aç'}
          onClick={() => {
            onToggleSound();
            playChirp(soundEnabled ? 800 : 1300);
          }}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            soundEnabled 
              ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
              : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Voice Speech Output Toggle */}
        <button
          id="btn-voice-toggle"
          title={voiceEnabled ? 'JARVIS Sesli Yanıtı Kapat' : 'JARVIS Sesli Yanıtı Aç'}
          onClick={() => {
            onToggleVoice();
            playChirp(1200);
          }}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            voiceEnabled 
              ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
              : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${voiceEnabled ? 'text-cyan-300' : 'text-slate-500'}`} />
        </button>

        {/* Window controls: Minimize, Maximize, Close */}
        <div className="flex items-center space-x-1 pl-2 border-l border-cyan-900/50">
          <button
            id="btn-win-minimize"
            title="Pencereyi Küçült"
            onClick={() => {
              playChirp(900);
              onToggleCompact();
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-200 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <button
            id="btn-win-maximize"
            title={isMaximized ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            onClick={toggleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-200 cursor-pointer"
          >
            {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" />}
          </button>

          <button
            id="btn-win-close"
            title="Kapat"
            onClick={() => {
              playChirp(700);
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
