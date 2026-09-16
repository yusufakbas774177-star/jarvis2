import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  CloudSun, 
  Cpu, 
  Activity, 
  Wifi, 
  Volume2, 
  Mic, 
  Sparkles, 
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { playCommandSuccess, playChirp } from '../utils/soundEffects';

export interface LocationWeatherState {
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  tempC: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  loading: boolean;
  error?: string;
}

interface NeuralCoreHUDProps {
  isSpeaking: boolean;
  isListening: boolean;
  onPulseCore?: () => void;
  locationWeather: LocationWeatherState;
  onRefreshLocation: () => void;
  devicesCount: number;
  onOpenRadar?: () => void;
  radarHighlight?: string;
  nearbyCitiesSummary?: string;
}

export const NeuralCoreHUD: React.FC<NeuralCoreHUDProps> = ({
  isSpeaking,
  isListening,
  onPulseCore,
  locationWeather,
  onRefreshLocation,
  devicesCount,
  onOpenRadar,
  radarHighlight,
  nearbyCitiesSummary
}) => {
  const [pulseScale, setPulseScale] = useState(1);
  const [sineOffset, setSineOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSineOffset((prev) => (prev + 1) % 360);
      setPulseScale(1 + Math.sin(Date.now() / 600) * 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleCoreClick = () => {
    playCommandSuccess();
    if (onPulseCore) onPulseCore();
  };

  // Generate dynamic frequency waveform bars based on speech status
  const barsCount = 32;
  const barHeights = Array.from({ length: barsCount }).map((_, i) => {
    if (isSpeaking) {
      return 18 + Math.sin(Date.now() / 70 + i * 0.4) * 32 + Math.random() * 20;
    }
    if (isListening) {
      return 14 + Math.sin(Date.now() / 100 + i * 0.3) * 22;
    }
    return 8 + Math.sin(Date.now() / 500 + i * 0.35) * 6;
  });

  return (
    <div id="neural-core-hud-container" className="flex flex-col items-center justify-between h-full p-2 select-none">
      {/* Active Location & Weather Header Banner */}
      <div className="w-full bg-[#071732]/90 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(0,210,255,0.1)]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            <MapPin className="w-4 h-4 text-cyan-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-100 font-sans">
                {locationWeather.loading ? 'Konum Alınıyor...' : `${locationWeather.city}, ${locationWeather.country}`}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                CANLI KONUM
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/70 font-mono flex items-center space-x-2 mt-0.5">
              <span>{locationWeather.condition}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{locationWeather.tempC}°C</span>
              <span>•</span>
              <span>Nem: %{locationWeather.humidity}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playChirp(1200);
            onRefreshLocation();
          }}
          title="Konumu ve Hava Durumunu Yenile"
          className="p-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${locationWeather.loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Regional Radar & News Intelligence Bar */}
      {onOpenRadar && (
        <div 
          onClick={() => {
            playChirp(1100);
            onOpenRadar();
          }}
          className="w-full mt-2 bg-[#061633]/90 hover:bg-[#09224f] border border-cyan-500/30 hover:border-cyan-400/60 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center space-x-2 text-xs truncate mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-cyan-300 font-bold font-mono shrink-0">Bölgesel Radar:</span>
            <span className="text-slate-300 truncate text-[11px] font-sans">
              {radarHighlight || '1-3 Gün: Lodos / Feribot Uyarısı • Çevre İller: Kocaeli, Bursa, İstanbul'}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 group-hover:text-cyan-200 shrink-0">
            <span>Radarı Aç</span>
            <span>➔</span>
          </span>
        </div>
      )}

      {/* Central Neural Pulse / Voice Waveform Centerpiece */}
      <div 
        onClick={handleCoreClick}
        title="J.A.R.V.I.S. Nöral Çekirdek Durumu - Tıklayın"
        className="relative my-4 flex flex-col items-center justify-center cursor-pointer group"
      >
        {/* Holographic Glowing Field */}
        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-cyan-500/30 bg-[#051124]/60 flex items-center justify-center relative shadow-[0_0_40px_rgba(0,210,255,0.15)] group-hover:border-cyan-400/60 transition-all duration-300">
          
          {/* Subtle Dynamic Audio Frequency Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full flex items-center justify-center space-x-1 opacity-80 px-4">
              {barHeights.map((h, i) => (
                <div 
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isSpeaking 
                      ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' 
                      : isListening 
                      ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' 
                      : 'bg-cyan-700/50'
                  }`}
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

          {/* Center Orb / Assistant State Indicator */}
          <div 
            className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 z-10 ${
              isSpeaking
                ? 'bg-cyan-950/90 border-cyan-300 shadow-[0_0_35px_#00e5ff]'
                : isListening
                ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_35px_#f59e0b]'
                : 'bg-[#061833]/90 border-cyan-400/70 shadow-[0_0_20px_rgba(0,210,255,0.3)]'
            }`}
            style={{ transform: `scale(${pulseScale})` }}
          >
            {isSpeaking ? (
              <Volume2 className="w-8 h-8 text-cyan-200 animate-pulse" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-amber-300 animate-pulse" />
            ) : (
              <Sparkles className="w-8 h-8 text-cyan-400" />
            )}

            <span className="text-[11px] font-['Orbitron'] font-bold text-cyan-200 mt-1">
              {isSpeaking ? 'KONUŞUYOR' : isListening ? 'DİNLİYOR' : 'J.A.R.V.I.S.'}
            </span>
            <span className="text-[9px] text-cyan-400/70 font-mono">
              NÖRAL ASİSTAN
            </span>
          </div>
        </div>

        <span className="text-[10px] text-cyan-400/60 font-mono mt-2">
          Sesli etkileşim veya durum özeti için dokunun
        </span>
      </div>

      {/* Real-time Environment & System Telemetry Card */}
      <div className="w-full grid grid-cols-3 gap-2 bg-[#06142a]/90 p-3 rounded-xl border border-cyan-500/30 text-center font-mono text-xs">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-400/70">AKTİF CİHAZ</span>
          <span className="text-sm font-bold text-cyan-200 font-['Orbitron'] mt-0.5">
            {devicesCount}
          </span>
          <span className="text-[9px] text-emerald-400">SENKRONİZE</span>
        </div>

        <div className="flex flex-col items-center border-x border-cyan-500/20">
          <span className="text-[10px] text-cyan-400/70">HAVA SICAKLIĞI</span>
          <span className="text-sm font-bold text-amber-300 font-['Orbitron'] mt-0.5">
            {locationWeather.tempC}°C
          </span>
          <span className="text-[9px] text-cyan-300">RÜZGAR: {locationWeather.windSpeed} km/s</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-400/70">AĞ PROTOKOLÜ</span>
          <span className="text-sm font-bold text-sky-300 font-['Orbitron'] mt-0.5">
            GÜVENLİ
          </span>
          <span className="text-[9px] text-emerald-400">TLS / AES-256</span>
        </div>
      </div>
    </div>
  );
};
