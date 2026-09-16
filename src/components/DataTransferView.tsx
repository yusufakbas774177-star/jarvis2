import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Download, 
  Pause, 
  Play, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Server, 
  Globe, 
  Cpu, 
  Layers, 
  Plus,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { TransferJob } from '../types';
import { playChirp, playCommandSuccess, playDataBurst, playAlert } from '../utils/soundEffects';

interface DataTransferViewProps {
  transfers: TransferJob[];
  onStartTransfer: (job: TransferJob) => void;
  onUpdateTransfer: (updated: TransferJob) => void;
  onEmergencyDataDump: () => void;
}

export const DataTransferView: React.FC<DataTransferViewProps> = ({
  transfers,
  onStartTransfer,
  onUpdateTransfer,
  onEmergencyDataDump
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<TransferJob['protocol']>('Stark Quantum Tunnel');
  const [sourceNode, setSourceNode] = useState('Yerel Windows Bilgisayarı (C:\\ & D:\\)');
  const [destinationNode, setDestinationNode] = useState('Stark Orbital Veronica Uydusu');
  const [customFileName, setCustomFileName] = useState('Mark_LXXXV_Nanotech_Mesh.cad');
  const [customFileSize, setCustomFileSize] = useState('482.4 MB');
  const [activeSpeed, setActiveSpeed] = useState('1.42 GB/s');

  // Real-time speed & packet animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 1.35 + Math.random() * 0.25;
      setActiveSpeed(`${base.toFixed(2)} GB/s`);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Update active transfers progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      transfers.forEach((job) => {
        if (job.status === 'TRANSFERRING' && job.progress < 100) {
          const nextProgress = Math.min(100, job.progress + 4);
          const isDone = nextProgress >= 100;
          if (isDone) {
            playCommandSuccess();
          } else if (Math.random() > 0.6) {
            playDataBurst();
          }
          onUpdateTransfer({
            ...job,
            progress: nextProgress,
            status: isDone ? 'COMPLETED' : 'TRANSFERRING',
            eta: isDone ? 'Tamamlandı' : `${Math.max(1, Math.ceil((100 - nextProgress) * 0.15))} sn`
          });
        }
      });
    }, 800);
    return () => clearInterval(timer);
  }, [transfers, onUpdateTransfer]);

  const handleLaunchTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileName.trim()) return;
    playCommandSuccess();

    const newJob: TransferJob = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      filename: customFileName,
      size: customFileSize,
      sizeBytes: 500000000,
      source: sourceNode,
      destination: destinationNode,
      protocol: selectedProtocol,
      progress: 0,
      speed: activeSpeed,
      status: 'TRANSFERRING',
      cipher: 'STARK-SHA-512',
      startedAt: new Date().toLocaleTimeString(),
      eta: '8.2 sn'
    };

    onStartTransfer(newJob);
  };

  const handleDownloadTransferredPackage = (job: TransferJob) => {
    playCommandSuccess();
    const payload = `--- STARK INDUSTRIES QUANTUM ENCRYPTED PAYLOAD ---\nTransfer ID: ${job.id}\nFilename: ${job.filename}\nCipher: ${job.cipher}\nSource: ${job.source}\nDestination: ${job.destination}\nTransferred: 100% Verified`;
    const blob = new Blob([payload], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STARK_TRANSFERRED_${job.filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="data-transfer-view" className="h-full flex flex-col space-y-4 p-4 overflow-y-auto">
      {/* Top Banner: Quantum Transfer Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#06142a]/95 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            <h2 className="text-sm md:text-base font-bold text-cyan-200 font-['Orbitron'] tracking-wider">
              STARK LINK // KUANTUM VERİ AKTARIM MERKEZİ
            </h2>
          </div>
          <p className="text-xs text-cyan-400/70 font-sans mt-0.5">
            Çok kanallı veri aktarımı: Yerel PC, Stark Uyduları ve Şifreli Kasalar arası güvenli tünelleme.
          </p>
        </div>

        {/* Telemetry quick stats & Emergency dump */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 bg-cyan-950/80 rounded-lg border border-cyan-500/30 text-center font-mono">
            <div className="text-[10px] text-cyan-400/70">ANLIK AKTARIM HIZI</div>
            <div className="text-xs font-bold text-cyan-200 font-['Orbitron']">{activeSpeed}</div>
          </div>

          <button
            id="btn-emergency-data-dump"
            onClick={() => {
              playAlert();
              onEmergencyDataDump();
            }}
            title="Tüm kritik planları derhal Veronica uydusuna boşalt"
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-500/40 text-rose-200 border border-rose-400/50 text-xs font-bold font-['Orbitron'] flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)]"
          >
            <Zap className="w-3.5 h-3.5 text-rose-300" />
            <span>Acil Durum Aktarımı</span>
          </button>
        </div>
      </div>

      {/* Holographic Transfer Beam Visualization */}
      <div className="bg-[#051125]/90 backdrop-blur-md p-5 rounded-xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Source Node Box */}
          <div className="flex items-center space-x-3 bg-cyan-950/60 p-3.5 rounded-xl border border-cyan-500/30 w-full md:w-auto">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono">KAYNAK DÜĞÜM</div>
              <div className="text-xs font-bold text-cyan-100 font-['Orbitron']">{sourceNode}</div>
              <div className="text-[9px] text-emerald-400 font-mono">GÜVENLİ BAĞLANTI (SHA-512)</div>
            </div>
          </div>

          {/* Animated Transfer Beam / Arrow */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
            <div className="flex items-center justify-between w-full text-[10px] font-mono text-cyan-300 mb-1">
              <span>KUANTUM TÜNELİ: AÇIK</span>
              <span className="text-emerald-400 font-bold">{activeSpeed}</span>
            </div>
            <div className="relative w-full h-3 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-75" />
              {/* Animated streaming packet blips */}
              <div className="absolute top-0 bottom-0 w-8 bg-cyan-300 rounded-full animate-ping opacity-75" style={{ animationDuration: '1s' }} />
            </div>
            <div className="text-[9px] text-cyan-400/60 font-mono mt-1">
              0.12ms Gecikme • Sıfır Paket Kaybı • StarkNet v7
            </div>
          </div>

          {/* Destination Node Box */}
          <div className="flex items-center space-x-3 bg-cyan-950/60 p-3.5 rounded-xl border border-cyan-500/30 w-full md:w-auto">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-sky-400 font-mono">HEDEF İSTASYON</div>
              <div className="text-xs font-bold text-sky-100 font-['Orbitron']">{destinationNode}</div>
              <div className="text-[9px] text-emerald-400 font-mono">YAZMA İZNİ DOĞRULANDI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Start New Transfer Form */}
      <div className="bg-[#06142a]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30">
        <div className="flex items-center space-x-2 mb-3">
          <Plus className="w-4 h-4 text-cyan-400" />
          <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200">
            YENİ VERİ AKTARIMI BAŞLAT
          </h3>
        </div>

        <form onSubmit={handleLaunchTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="block text-cyan-300 mb-1">Dosya / Paket Adı:</label>
            <input
              type="text"
              required
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-cyan-300 mb-1">Kaynak Düğüm:</label>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
            >
              <option value="Yerel Windows Bilgisayarı (C:\ & D:\)">Yerel Windows Bilgisayarı</option>
              <option value="Malibu Atölye Sunucusu">Malibu Atölye Sunucusu</option>
              <option value="Mark 85 Zırh Veri Kasası">Mark 85 Zırh Veri Kasası</option>
            </select>
          </div>

          <div>
            <label className="block text-cyan-300 mb-1">Hedef İstasyon:</label>
            <select
              value={destinationNode}
              onChange={(e) => setDestinationNode(e.target.value)}
              className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
            >
              <option value="Stark Orbital Veronica Uydusu">Stark Orbital Veronica Uydusu</option>
              <option value="Stark Secure Cloud (Avenger Vault)">Stark Secure Cloud</option>
              <option value="Harici Şifreli Flash Bellek (E:\)">Harici Şifreli Bellek</option>
              <option value="Avengers Karargahı (NYC)">Avengers Karargahı (NYC)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-['Orbitron'] flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.4)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Aktarımı Başlat</span>
            </button>
          </div>
        </form>
      </div>

      {/* Transfer Queue & History List */}
      <div className="flex-1 bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/30 overflow-hidden flex flex-col">
        <div className="p-3 bg-[#081830] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200">
              AKTİF VE TAMAMLANAN AKTARIMLAR ({transfers.length})
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            Kriptolama: AES-256-GCM / SHA-512
          </span>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {transfers.map((job) => {
            const isCompleted = job.status === 'COMPLETED';
            const isPaused = job.status === 'PAUSED';

            return (
              <div
                key={job.id}
                className="bg-[#071a38]/80 p-3.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2.5 shadow-[0_0_10px_rgba(0,210,255,0.06)]"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                      {job.id}
                    </span>
                    <span className="text-xs font-bold text-cyan-100 font-sans">{job.filename}</span>
                    <span className="text-[11px] text-cyan-400/60 font-mono">({job.size})</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-slate-400">{job.source}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">{job.destination}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                    <span className="flex items-center space-x-1.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <RefreshCw className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : 'animate-spin text-cyan-400'}`} />
                      )}
                      <span>{isCompleted ? 'Tamamlandı' : isPaused ? 'Duraklatıldı' : `Aktarılıyor (${job.speed})`}</span>
                    </span>
                    <span className="font-bold font-['Orbitron']">{job.progress}%</span>
                  </div>

                  <div className="w-full h-2 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/30">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                          : isPaused
                          ? 'bg-amber-400'
                          : 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                {/* Controls & verification */}
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 pt-1 border-t border-cyan-500/15">
                  <div className="flex items-center space-x-2">
                    <span>Protokol: {job.protocol}</span>
                    <span>•</span>
                    <span className="text-emerald-400">Şifre: {job.cipher}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          playChirp(1000);
                          onUpdateTransfer({
                            ...job,
                            status: isPaused ? 'TRANSFERRING' : 'PAUSED'
                          });
                        }}
                        className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 cursor-pointer"
                      >
                        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        <span>{isPaused ? 'Devam Et' : 'Duraklat'}</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => handleDownloadTransferredPackage(job)}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/40 flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Paketi İndir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
