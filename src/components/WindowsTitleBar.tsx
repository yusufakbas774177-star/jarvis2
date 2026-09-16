import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Mic, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  FolderKanban,
  Home,
  Send,
  Sparkles,
  Layers
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
    { id: 'hud', label: 'J.A.R.V.I.S. HUD', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'smarthome', label: 'Akıllı Ev', icon: <Home className="w-4 h-4 text-emerald-400" />, badge: '12 Cihaz' },
    { id: 'files', label: 'Dosya Gezgini', icon: <FolderKanban className="w-4 h-4 text-amber-400" />, badge: 'C: D: Z:' },
    { id: 'transfer', label: 'Veri Aktarımı', icon: <Radio className="w-4 h-4 text-sky-400" />, badge: '1.4 GB/s' }
  ];

  return (
    <header 
      id="windows-title-bar" 
      className="h-12 bg-[#060e1c]/95 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between px-3 select-none z-50 text-xs font-mono text-cyan-200"
    >
      {/* Left: Stark Brand & App Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping opacity-60 absolute" />
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 font-bold tracking-wider text-cyan-300 font-['Orbitron']">
            <span>STARK OS</span>
            <span className="text-[10px] text-cyan-400/70 font-sans font-normal">v7.4</span>
            <span className="text-gray-500 font-normal">|</span>
            <span className="text-white">J.A.R.V.I.S.</span>
          </div>
          <div className="text-[9px] text-cyan-400/60 tracking-tight">
            Windows 11 Workstation Edition
          </div>
        </div>
      </div>

      {/* Middle: Main Navigation Bar */}
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

      {/* Right: Quick Controls & Windows Standard Buttons */}
      <div className="flex items-center space-x-2">
        {/* Telemetry quick indicators */}
        <div className="hidden lg:flex items-center space-x-2 px-2 py-1 bg-cyan-950/40 rounded border border-cyan-500/20 text-[10px]">
          <span className="flex items-center text-emerald-400 space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI CORE: AKTİF</span>
          </span>
          <span className="text-cyan-600">|</span>
          <span className="text-cyan-400">ARK: 100%</span>
        </div>

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
