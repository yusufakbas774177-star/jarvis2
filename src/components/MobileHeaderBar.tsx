import React from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Wifi, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { DeviceInfo, DeviceMode } from '../types';
import { playChirp } from '../utils/soundEffects';

interface MobileHeaderBarProps {
  deviceInfo: DeviceInfo;
  deviceMode: DeviceMode;
  onToggleDeviceMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  locationCity: string;
  tempC?: number;
}

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = ({
  deviceInfo,
  deviceMode,
  onToggleDeviceMode,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  locationCity,
  tempC
}) => {
  return (
    <header 
      id="mobile-header-bar" 
      className="bg-[#050e1f]/95 backdrop-blur-md border-b border-cyan-500/30 px-3 py-2 flex items-center justify-between z-40 select-none"
    >
      {/* Left: Assistant Logo & Active Device Tag */}
      <div className="flex items-center space-x-2.5">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/70 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping opacity-60 absolute" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
        </div>
        <div>
          <div className="flex items-center space-x-1 font-bold text-xs tracking-wider text-cyan-300 font-['Orbitron']">
            <span>J.A.R.V.I.S.</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              MOBİL
            </span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
            <Smartphone className="w-2.5 h-2.5 text-cyan-400" />
            <span>{deviceInfo.platformName}</span>
          </div>
        </div>
      </div>

      {/* Right: Device Telemetry (Battery, Location, Audio, Mode Switch) */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        {/* Location & Temp */}
        <div className="hidden sm:flex items-center space-x-1 text-[10px] text-cyan-300 bg-[#091733] px-2 py-0.5 rounded border border-cyan-500/20">
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span>{locationCity} {tempC !== undefined ? `${tempC}°C` : ''}</span>
        </div>

        {/* Battery Telemetry */}
        <div 
          className="flex items-center space-x-1 text-[10px] bg-[#091733] px-1.5 py-0.5 rounded border border-cyan-500/20 text-cyan-200"
          title="Pil Durumu"
        >
          {deviceInfo.isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>{deviceInfo.batteryLevel !== null ? `%${deviceInfo.batteryLevel}` : '%88'}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => { playChirp(1000); onToggleSound(); }}
          className="p-1.5 rounded-lg bg-[#091733] border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 cursor-pointer"
          title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
        </button>

        {/* Switch to Desktop Mode manually */}
        <button
          onClick={() => { playChirp(1200); onToggleDeviceMode(); }}
          className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[10px] flex items-center gap-1 cursor-pointer"
          title="Masaüstü Görünümüne Geç"
        >
          <Monitor className="w-3 h-3 text-cyan-400" />
          <span className="hidden xs:inline">PC Modu</span>
        </button>
      </div>
    </header>
  );
};
