import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { playChirp } from '../utils/soundEffects';

interface SystemTelemetryBarProps {
  onStartMenuClick?: () => void;
  arcOutput?: number;
}

export const SystemTelemetryBar: React.FC<SystemTelemetryBarProps> = ({
  onStartMenuClick,
  arcOutput = 3200
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [cpuUsage, setCpuUsage] = useState(14);
  const [ramUsage, setRamUsage] = useState(8.6);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const perfTimer = setInterval(() => {
      setCpuUsage(12 + Math.floor(Math.random() * 8));
      setRamUsage(parseFloat((8.4 + Math.random() * 0.5).toFixed(1)));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(perfTimer);
    };
  }, []);

  return (
    <footer 
      id="windows-telemetry-bar" 
      className="h-10 bg-[#050c18]/95 backdrop-blur-md border-t border-cyan-500/30 flex items-center justify-between px-3 select-none text-[11px] font-mono text-cyan-300 z-40"
    >
      {/* Left: Stark Start Emblem */}
      <div className="flex items-center space-x-3">
        <button
          id="btn-stark-start-menu"
          onClick={() => {
            playChirp(1300);
            if (onStartMenuClick) onStartMenuClick();
          }}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-950/90 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 transition-all cursor-pointer shadow-[0_0_8px_rgba(0,210,255,0.2)]"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
          <span className="font-['Orbitron'] font-bold text-xs">BAŞLAT</span>
        </button>

        <div className="hidden sm:flex items-center space-x-1 text-slate-400">
          <span className="text-cyan-400 font-bold">DESKTOP-STARK-PRO</span>
          <span>|</span>
          <span className="text-emerald-400">GÜVENLİK: SEVİYE 7</span>
        </div>
      </div>

      {/* Middle: System Performance Gauges */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>ARK:</span>
          <span className="font-bold text-cyan-200">{arcOutput} MW</span>
        </div>

        <div className="flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>CPU:</span>
          <span className="font-bold text-cyan-200">{cpuUsage}%</span>
        </div>

        <div className="flex items-center space-x-1">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>RAM:</span>
          <span className="font-bold text-cyan-200">{ramUsage} / 64 GB</span>
        </div>

        <div className="flex items-center space-x-1 text-emerald-400">
          <Wifi className="w-3.5 h-3.5" />
          <span>VERONICA SATELLITE (3.9ms)</span>
        </div>
      </div>

      {/* Right: Date & Clock */}
      <div className="flex items-center space-x-2">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-bold text-cyan-100 font-['Orbitron'] tracking-wider">{timeStr}</span>
        <span className="text-slate-400 hidden sm:inline">{dateStr}</span>
      </div>
    </footer>
  );
};
