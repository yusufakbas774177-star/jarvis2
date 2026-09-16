import React, { useEffect, useState } from 'react';
import { Shield, Zap, Activity, Cpu, BatteryCharging } from 'lucide-react';
import { playArcPulse, playChirp } from '../utils/soundEffects';

interface ArcReactorHUDProps {
  isSpeaking: boolean;
  isListening: boolean;
  arcOutput?: number; // MW
  onPulseCore?: () => void;
}

export const ArcReactorHUD: React.FC<ArcReactorHUDProps> = ({
  isSpeaking,
  isListening,
  arcOutput = 3200,
  onPulseCore
}) => {
  const [rotation, setRotation] = useState(0);
  const [fluxLevel, setFluxLevel] = useState(99.4);

  // Subtle continuous rotation and pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
      setFluxLevel(99.2 + Math.sin(Date.now() / 1000) * 0.6);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleCoreClick = () => {
    playArcPulse();
    if (onPulseCore) onPulseCore();
  };

  // Generate frequency waveform bars
  const barsCount = 28;
  const barHeights = Array.from({ length: barsCount }).map((_, i) => {
    if (isSpeaking) {
      return 15 + Math.sin(Date.now() / 80 + i) * 35 + Math.random() * 25;
    }
    if (isListening) {
      return 10 + Math.sin(Date.now() / 120 + i) * 20;
    }
    return 8 + Math.sin(Date.now() / 600 + i * 0.5) * 6;
  });

  return (
    <div 
      id="arc-reactor-hud-container" 
      className="relative flex flex-col items-center justify-center p-4 select-none"
    >
      {/* Central Holographic Arc Reactor Stage */}
      <div 
        onClick={handleCoreClick}
        title="Ark Reaktörü Diagnostiği İçin Tıklayın"
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center cursor-pointer group"
      >
        {/* Outer Glowing Hologram Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 shadow-[0_0_50px_rgba(0,210,255,0.15)] group-hover:border-cyan-400/50 transition-all duration-500" />
        
        {/* Outer Rotating Segmented Track */}
        <div 
          className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin-slow"
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {/* Counter-Rotating Intermediate Ring with Tech Hash Marks */}
        <div 
          className="absolute inset-8 rounded-full border-2 border-cyan-300/30 animate-spin-reverse-slow"
        >
          {/* Radial Tick Markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div 
              key={deg}
              className="absolute w-2 h-0.5 bg-cyan-400/70 top-1/2 left-0 origin-[calc(50%+4rem)]"
              style={{ transform: `rotate(${deg}deg) translateY(-50%)` }}
            />
          ))}
        </div>

        {/* Inner Arc Core Coil Array (10 Electromagnet nodes) */}
        <div className="absolute inset-16 rounded-full flex items-center justify-center">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36) * (Math.PI / 180);
            const radius = 68; // px
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div 
                key={i}
                className={`absolute w-3 h-5 rounded-sm border transition-all duration-300 ${
                  isSpeaking 
                    ? 'bg-cyan-300/90 border-cyan-100 shadow-[0_0_12px_#00e5ff]' 
                    : isListening 
                    ? 'bg-amber-400/80 border-amber-200 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-cyan-900/60 border-cyan-400/60 shadow-[0_0_6px_rgba(0,229,255,0.4)]'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${i * 36 + 90}deg)`
                }}
              />
            );
          })}
        </div>

        {/* Inner Palladium / New Element Core Center */}
        <div className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 z-10 ${
          isSpeaking 
            ? 'bg-cyan-900/90 border-cyan-300 shadow-[0_0_35px_#00e5ff]' 
            : isListening
            ? 'bg-amber-950/90 border-amber-300 shadow-[0_0_35px_#f59e0b]'
            : 'bg-[#041126]/90 border-cyan-400/80 shadow-[0_0_20px_rgba(0,229,255,0.5)]'
        }`}>
          {/* Pulsing Core Center Graphic */}
          <div className="w-12 h-12 rounded-full border border-cyan-300/60 flex items-center justify-center bg-cyan-950/50">
            <Zap className={`w-6 h-6 transition-all duration-300 ${
              isSpeaking 
                ? 'text-cyan-200 animate-pulse scale-110' 
                : isListening 
                ? 'text-amber-300 animate-pulse'
                : 'text-cyan-400'
            }`} />
          </div>

          <span className="text-[10px] font-['Orbitron'] tracking-wider text-cyan-300 font-bold mt-1">
            {isSpeaking ? 'KONUŞUYOR' : isListening ? 'DİNLİYOR' : 'J.A.R.V.I.S.'}
          </span>
          <span className="text-[8px] text-cyan-400/70 font-mono">
            {isSpeaking ? 'SES ÇIKIŞI' : isListening ? 'SES GİRİŞİ' : 'MARK VII'}
          </span>
        </div>

        {/* Audio Frequency Waveform Arc Ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full flex items-center justify-center space-x-1 opacity-70">
            {barHeights.map((h, i) => (
              <div 
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isSpeaking 
                    ? 'bg-cyan-400' 
                    : isListening 
                    ? 'bg-amber-400' 
                    : 'bg-cyan-600/40'
                }`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Core Real-Time Telemetry Bar underneath Arc Reactor */}
      <div 
        id="arc-reactor-metrics"
        className="w-full max-w-lg mt-4 grid grid-cols-3 gap-2 bg-[#051329]/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 text-center font-mono"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 text-[10px] text-cyan-400/70">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>ARK ÇIKIŞI</span>
          </div>
          <span className="text-sm font-bold text-cyan-200 font-['Orbitron']">
            {arcOutput} MW
          </span>
          <span className="text-[9px] text-emerald-400">KARARLI (100%)</span>
        </div>

        <div className="flex flex-col items-center border-x border-cyan-500/20">
          <div className="flex items-center space-x-1 text-[10px] text-cyan-400/70">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>MANYETİK AKI</span>
          </div>
          <span className="text-sm font-bold text-amber-300 font-['Orbitron']">
            {fluxLevel.toFixed(1)}%
          </span>
          <span className="text-[9px] text-cyan-400/80">REKÜPERATÖR AKTİF</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 text-[10px] text-cyan-400/70">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>ZIRH PROTOKOLÜ</span>
          </div>
          <span className="text-sm font-bold text-emerald-300 font-['Orbitron']">
            MARK 85
          </span>
          <span className="text-[9px] text-emerald-400">SENKRONİZE</span>
        </div>
      </div>
    </div>
  );
};
