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
  HardDrive,
  Cloud
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
  const [selectedProtocol, setSelectedProtocol] = useState<TransferJob['protocol']>('Direct Fiber Link');
  const [sourceNode, setSourceNode] = useState('Yerel Bilgisayar (C:\\ & D:\\)');
  const [destinationNode, setDestinationNode] = useState('Güvenli Bulut Yedekleme Sunucusu');
  const [customFileName, setCustomFileName] = useState('Ev_Otomasyonu_Yedek_Arsivi.tar.gz');
  const [customFileSize, setCustomFileSize] = useState('320.5 MB');
  const [activeSpeed, setActiveSpeed] = useState('1.15 GB/s');

  // Real-time speed indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 1.10 + Math.random() * 0.20;
      setActiveSpeed(`${base.toFixed(2)} GB/s`);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Update active transfers progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      transfers.forEach((job) => {
        if (job.status === 'TRANSFERRING' && job.progress < 100) {
          const nextProgress = Math.min(100, job.progress + 6);
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
            eta: isDone ? 'Tamamlandı' : `${Math.max(1, Math.ceil((100 - nextProgress) * 0.12))} sn`
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
      sizeBytes: 335544320,
      source: sourceNode,
      destination: destinationNode,
      protocol: selectedProtocol,
      progress: 0,
      speed: activeSpeed,
      status: 'TRANSFERRING',
      cipher: 'AES-256-GCM',
      startedAt: new Date().toLocaleTimeString(),
      eta: '6.5 sn'
    };

    onStartTransfer(newJob);
  };

  return (
    <div id="data-transfer-view" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Banner: Data Transfer Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#06142a]/95 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 gap-4 shadow-[0_0_20px_rgba(0,180,255,0.1)]">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm md:text-base font-bold text-cyan-200 font-['Orbitron'] tracking-wider">
              GÜVENLİ VERİ AKTARIMI & SENKRONİZASYON
            </h2>
          </div>
          <p className="text-xs text-cyan-400/70 font-sans mt-0.5">
            Yerel diskleriniz (C:, D:) ile harici depolama ve bulut sunucuları arasında yüksek hızlı veri transferi.
          </p>
        </div>

        {/* Global Transfer Stats & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 font-mono text-xs text-cyan-300">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>HAT HIZI: <b className="text-cyan-100 font-['Orbitron']">{activeSpeed}</b></span>
          </div>

          <button
            id="btn-emergency-dump"
            onClick={() => {
              playAlert();
              onEmergencyDataDump();
            }}
            title="Tüm yerel ayarları ve dosyaları tek tıkla güvenli buluta yedekle"
            className="px-3.5 py-2 rounded-lg bg-rose-600/30 hover:bg-rose-500/40 text-rose-200 border border-rose-500/50 text-xs font-mono flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
          >
            <Cloud className="w-3.5 h-3.5 text-rose-300" />
            <span>Tam Sistem Yedeği Başlat</span>
          </button>
        </div>
      </div>

      {/* Grid: Create Transfer vs Active Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left (Col 5): New Transfer Form */}
        <div className="lg:col-span-5 bg-[#051124]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between shadow-[0_0_15px_rgba(0,180,255,0.05)]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200 tracking-wider">
                YENİ AKTARIM GÖREVİ
              </h3>
              <span className="text-[10px] text-cyan-400/70 font-mono">TLS 1.3 / AES-256</span>
            </div>

            <form onSubmit={handleLaunchTransfer} className="space-y-3 mt-3 text-xs font-mono">
              <div>
                <label className="block text-cyan-300 mb-1">Paket / Dosya Adı:</label>
                <input
                  type="text"
                  required
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Dosya_Adi.enc"
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-cyan-300 mb-1">Boyut:</label>
                  <input
                    type="text"
                    value={customFileSize}
                    onChange={(e) => setCustomFileSize(e.target.value)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 mb-1">Protokol:</label>
                  <select
                    value={selectedProtocol}
                    onChange={(e) => setSelectedProtocol(e.target.value as any)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  >
                    <option value="Direct Fiber Link">Direct Fiber Link</option>
                    <option value="Encrypted VPN">Encrypted VPN Tunnel</option>
                    <option value="Local P2P">Yerel P2P Ağı</option>
                    <option value="Stark Quantum Tunnel">Güvenli Kriptolu Tünel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-cyan-300 mb-1">Kaynak Noktası:</label>
                <input
                  type="text"
                  value={sourceNode}
                  onChange={(e) => setSourceNode(e.target.value)}
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-1">Hedef Depolama:</label>
                <input
                  type="text"
                  value={destinationNode}
                  onChange={(e) => setDestinationNode(e.target.value)}
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                id="btn-launch-transfer-submit"
                className="w-full mt-3 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-['Orbitron'] flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.4)]"
              >
                <Send className="w-4 h-4" />
                <span>AKTARIMI BAŞLAT</span>
              </button>
            </form>
          </div>

          {/* Transfer Info Note */}
          <div className="mt-4 p-3 bg-cyan-950/40 rounded-lg border border-cyan-500/20 text-[11px] text-cyan-300/80 font-mono">
            💡 <b>İpucu:</b> Dosya Gezgini sekmesinde herhangi bir dosyanın yanındaki aktarım ikonuna tıklayarak doğrudan kuyruğa ekleyebilirsiniz.
          </div>
        </div>

        {/* Right (Col 7): Active Transfers Queue & Progress */}
        <div className="lg:col-span-7 bg-[#051124]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 flex flex-col overflow-hidden shadow-[0_0_15px_rgba(0,180,255,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200 tracking-wider">
                AKTARIM KUYRUĞU ({transfers.length})
              </h3>
            </div>
            <span className="text-[10px] text-cyan-400/70 font-mono">
              {transfers.filter(t => t.status === 'TRANSFERRING').length} Aktif Görev
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
            {transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 text-xs font-mono space-y-2">
                <Radio className="w-8 h-8 text-cyan-900" />
                <p>Şu anda çalışan veya tamamlanmış veri aktarımı yok.</p>
              </div>
            ) : (
              transfers.map((job) => {
                const isCompleted = job.status === 'COMPLETED';
                return (
                  <div
                    key={job.id}
                    id={`transfer-job-${job.id}`}
                    className="p-3 rounded-lg bg-[#071936] border border-cyan-500/20 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-cyan-100 font-sans">{job.filename}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                            {job.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-400/60 mt-0.5">
                          {job.source} ➔ {job.destination}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] font-bold ${
                          isCompleted ? 'text-emerald-400' : 'text-sky-300'
                        }`}>
                          {isCompleted ? '✓ TAMAMLANDI' : `%${job.progress}`}
                        </span>
                        <div className="text-[10px] text-slate-400">{job.size}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>

                    {/* Footer Metrics */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Protokol: {job.protocol}</span>
                      <span>Hız: {job.speed}</span>
                      <span>Kalan: {job.eta}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
