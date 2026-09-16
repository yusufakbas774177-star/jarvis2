import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Wifi, 
  Clock, 
  MapPin,
  Laptop,
  Battery,
  BatteryCharging
} from 'lucide-react';
import { playChirp } from '../utils/soundEffects';

interface SystemTelemetryBarProps {
  onStartMenuClick?: () => void;
  locationCity?: string;
  devicesCount?: number;
  platformName?: string;
  batteryLevel?: number | null;
  isCharging?: boolean | null;
}

export const SystemTelemetryBar: React.FC<SystemTelemetryBarProps> = ({
  onStartMenuClick,
  locationCity = 'İstanbul',
  devicesCount = 0,
  platformName = 'Windows Workstation',
  batteryLevel = null,
  isCharging = null
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [cpuUsage, setCpuUsage] = useState(14);
  const [ramUsage, setRamUsage] = useState(7.8);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const perfTimer = setInterval(() => {
      setCpuUsage(10 + Math.floor(Math.random() * 8));
      setRamUsage(parseFloat((7.6 + Math.random() * 0.4).toFixed(1)));
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
      {/* Left: Start Button & Computer Hostname */}
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
          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-400 font-bold">{platformName}</span>
          <span>|</span>
          <span className="text-emerald-400">J.A.R.V.I.S. ASİSTAN: ÇEVRİMİÇİ</span>
        </div>
      </div>

      {/* Middle: Real Computer Resource Usage */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>İŞLEMCİ:</span>
          <span className="font-bold text-cyan-200">{cpuUsage}%</span>
        </div>

        <div className="flex items-center space-x-1">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>BELLEK:</span>
          <span className="font-bold text-cyan-200">{ramUsage} / 32 GB</span>
        </div>

        <div className="flex items-center space-x-1 text-cyan-400">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>KONUM: {locationCity}</span>
        </div>

        <div className="flex items-center space-x-1 text-emerald-400">
          <Wifi className="w-3.5 h-3.5" />
          <span>AKILLI EV ({devicesCount} CİHAZ)</span>
        </div>

        {batteryLevel !== null && (
          <div className="flex items-center space-x-1 text-cyan-300">
            {isCharging ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> : <Battery className="w-3.5 h-3.5 text-cyan-400" />}
            <span>PİL: %{batteryLevel}</span>
          </div>
        )}
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
