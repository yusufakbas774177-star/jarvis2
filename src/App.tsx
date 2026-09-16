import React, { useState, useEffect, useCallback } from 'react';
import { 
  SystemView, 
  SmartDevice, 
  FileItem, 
  TransferJob, 
  ChatMessage, 
  JarvisAction 
} from './types';
import { 
  INITIAL_SMART_DEVICES, 
  INITIAL_FILES, 
  INITIAL_TRANSFERS 
} from './data/mockSystem';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { ArcReactorHUD } from './components/ArcReactorHUD';
import { JarvisConsole } from './components/JarvisConsole';
import { SmartHomeView } from './components/SmartHomeView';
import { FileExplorerView } from './components/FileExplorerView';
import { DataTransferView } from './components/DataTransferView';
import { SystemTelemetryBar } from './components/SystemTelemetryBar';
import { 
  playChirp, 
  playCommandSuccess, 
  playAlert, 
  setSoundEnabled 
} from './utils/soundEffects';
import { 
  speakText, 
  registerSpeechStatusListener, 
  stopSpeaking 
} from './utils/speech';
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  Maximize, 
  Radio, 
  Sparkles,
  Bot
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<SystemView>('hud');
  const [smartDevices, setSmartDevices] = useState<SmartDevice[]>(INITIAL_SMART_DEVICES);
  const [filesList, setFilesList] = useState<FileItem[]>(INITIAL_FILES);
  const [transfers, setTransfers] = useState<TransferJob[]>(INITIAL_TRANSFERS);

  // Audio and Speech State
  const [soundEnabledState, setSoundEnabledState] = useState(true);
  const [voiceEnabledState, setVoiceEnabledState] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Initial welcome message from J.A.R.V.I.S.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'jarvis',
      text: 'İyi günler Sayın Stark. J.A.R.V.I.S. Mark VII sistemleri Windows iş istasyonunuzda tam kapasiteyle devrede. Evinizdeki 12 akıllı ürün, yerel diskleriniz (C:, D:, Z:) ve kuantum veri aktarım hatları emrinizdedir. Size nasıl yardımcı olabilirim efendim?',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Sync speech status with Arc Reactor visualizer
  useEffect(() => {
    registerSpeechStatusListener((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Update sound synthesizer state
  const handleToggleSound = () => {
    const next = !soundEnabledState;
    setSoundEnabledState(next);
    setSoundEnabled(next);
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabledState;
    setVoiceEnabledState(next);
    if (!next) {
      stopSpeaking();
    }
  };

  // Execute structured action returned by J.A.R.V.I.S.
  const handleExecuteAction = useCallback((action: JarvisAction) => {
    if (action.type === 'SMART_HOME_CONTROL') {
      if (action.target === 'lights') {
        setSmartDevices((prev) =>
          prev.map((d) => (d.type === 'light' ? { ...d, state: Boolean(action.value) } : d))
        );
      } else if (action.target === 'thermostat') {
        setSmartDevices((prev) =>
          prev.map((d) =>
            d.type === 'thermostat' ? { ...d, value: Number(action.value) || 22 } : d
          )
        );
      } else if (action.target === 'security') {
        setSmartDevices((prev) =>
          prev.map((d) =>
            d.type === 'lock' || d.type === 'defense' ? { ...d, state: Boolean(action.value) } : d
          )
        );
      }
      playCommandSuccess();
    } else if (action.type === 'DATA_TRANSFER') {
      const newJob: TransferJob = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        filename: String(action.value || 'Stark_Quantum_Payload.enc'),
        size: '340.5 MB',
        sizeBytes: 357040128,
        source: 'Yerel Bilgisayar (C:\\)',
        destination: 'Stark Orbital Veronica Uydusu',
        protocol: 'Stark Quantum Tunnel',
        progress: 10,
        speed: '1.42 GB/s',
        status: 'TRANSFERRING',
        cipher: 'STARK-SHA-512',
        startedAt: new Date().toLocaleTimeString(),
        eta: '6.4 sn'
      };
      setTransfers((prev) => [newJob, ...prev]);
      playCommandSuccess();
    } else if (action.type === 'FILE_OPERATION') {
      setCurrentView('files');
    }
  }, []);

  // Send message to J.A.R.V.I.S. (via server /api/jarvis/chat)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            devicesCount: smartDevices.length,
            onlineLights: smartDevices.filter((d) => d.type === 'light' && d.state).length,
            transfersActive: transfers.filter((t) => t.status === 'TRANSFERRING').length
          }
        })
      });

      const data = await response.json();
      const replySpeech = data.speechText || 'Emredersiniz efendim.';
      const actions: JarvisAction[] = data.actions || [];

      // Execute actions
      actions.forEach((act) => handleExecuteAction(act));

      const jarvisMsg: ChatMessage = {
        id: `msg_jarvis_${Date.now()}`,
        sender: 'jarvis',
        text: replySpeech,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        actions
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      // Speak response aloud if voice output is enabled
      if (voiceEnabledState) {
        speakText(replySpeech);
      }
    } catch (err: any) {
      console.error('Failed to communicate with J.A.R.V.I.S.:', err);
      const fallbackReply = 'Emredersiniz efendim. Sistemler talebiniz doğrultusunda güncellendi.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'jarvis',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (voiceEnabledState) {
        speakText(fallbackReply);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Smart Home updates
  const handleUpdateSmartDevice = (updated: SmartDevice) => {
    setSmartDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleAddSmartDevice = (newDev: SmartDevice) => {
    setSmartDevices((prev) => [newDev, ...prev]);
  };

  const handleApplyScene = (sceneName: string) => {
    if (sceneName === 'lab_focus') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.room === 'lab') return { ...d, state: true, value: 100 };
          if (d.type === 'light' && d.room !== 'lab') return { ...d, state: false };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Atölye odak modu aktif efendim. Hologram projektörleri ve nanotek havalandırma maksimum güçte.');
      }
    } else if (sceneName === 'night_stealth') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') return { ...d, state: false };
          if (d.type === 'lock' || d.type === 'defense') return { ...d, state: true };
          if (d.type === 'thermostat') return { ...d, value: 20 };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Gece gizlilik ve güvenlik protokolü devreye alındı. Dronlar devriyede efendim.');
      }
    }
  };

  // File Explorer Actions
  const handleUploadFile = (file: FileItem) => {
    setFilesList((prev) => {
      const driveRoot = prev.find((d) => d.drive === file.drive);
      if (driveRoot) {
        return prev.map((d) =>
          d.drive === file.drive
            ? { ...d, children: [file, ...(d.children || [])] }
            : d
        );
      }
      return [file, ...prev];
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setFilesList((prev) =>
      prev.map((drive) => ({
        ...drive,
        children: drive.children?.filter((c) => c.id !== fileId)
      }))
    );
  };

  const handleSendToTransfer = (file: FileItem) => {
    const job: TransferJob = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      filename: file.name,
      size: file.size,
      sizeBytes: file.sizeBytes,
      source: `Yerel Dosya (${file.path})`,
      destination: 'Stark Orbital Veronica Uydusu',
      protocol: 'Stark Quantum Tunnel',
      progress: 0,
      speed: '1.42 GB/s',
      status: 'TRANSFERRING',
      cipher: 'STARK-SHA-512',
      startedAt: new Date().toLocaleTimeString(),
      eta: '5.2 sn'
    };
    setTransfers((prev) => [job, ...prev]);
    setCurrentView('transfer');
    playCommandSuccess();
    if (voiceEnabledState) {
      speakText(`${file.name} veri aktarım kuyruğuna alındı efendim.`);
    }
  };

  const handleJarvisAnalyzeFile = (file: FileItem) => {
    setCurrentView('hud');
    const prompt = `Lütfen şu dosyanın içeriğini ve sistem güvenliğini analiz et: "${file.name}" (Yol: ${file.path}, Boyut: ${file.size}).\nİçerik özeti:\n${file.content?.slice(0, 300) || 'İkili veri'}`;
    handleSendMessage(prompt);
  };

  // Data Transfer Updates
  const handleStartTransfer = (job: TransferJob) => {
    setTransfers((prev) => [job, ...prev]);
  };

  const handleUpdateTransfer = (updated: TransferJob) => {
    setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Clean Slate emergency dump
  const handleEmergencyDataDump = () => {
    const emergencyJob: TransferJob = {
      id: `TX-EMERGENCY-${Date.now()}`,
      filename: 'CLEAN_SLATE_FULL_ENCRYPTED_BACKUP.tar.enc',
      size: '2.84 GB',
      sizeBytes: 3049426124,
      source: 'Tüm Yerel Sistemler (C: & D: & Sensörler)',
      destination: 'Veronica Derin Uzay Uydusu (Yedek)',
      protocol: 'Stark Quantum Tunnel',
      progress: 5,
      speed: '2.10 GB/s',
      status: 'TRANSFERRING',
      cipher: 'STARK-SHA-512',
      startedAt: new Date().toLocaleTimeString(),
      eta: '4.8 sn'
    };
    setTransfers((prev) => [emergencyJob, ...prev]);
    setCurrentView('transfer');
    if (voiceEnabledState) {
      speakText('Acil durum Clean Slate veri tahliyesi başlatıldı efendim. Tüm Mark zırh planları şifrelenerek yörüngeye aktarılıyor.');
    }
  };

  return (
    <div 
      id="stark-windows-app-root" 
      className="w-screen h-screen flex flex-col bg-[#040914] text-cyan-100 overflow-hidden stark-scanlines stark-grid-bg font-['Rajdhani',sans-serif]"
    >
      {/* Windows 11 Title Bar */}
      <WindowsTitleBar
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        soundEnabled={soundEnabledState}
        onToggleSound={handleToggleSound}
        voiceEnabled={voiceEnabledState}
        onToggleVoice={handleToggleVoice}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
        onClose={() => {
          if (confirm('J.A.R.V.I.S. Windows oturumunu kapatmak istediğinizden emin misiniz?')) {
            window.location.reload();
          }
        }}
      />

      {/* Main App Workspace */}
      <main id="windows-workspace-container" className="flex-1 overflow-hidden relative flex flex-col">
        {isCompact ? (
          /* Mini Floating HUD Widget Mode */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-[#051329]/95 backdrop-blur-lg p-6 rounded-2xl border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(0,210,255,0.3)] flex flex-col items-center max-w-sm text-center">
              <ArcReactorHUD
                isSpeaking={isSpeaking}
                isListening={isListening}
                onPulseCore={() => {
                  if (voiceEnabledState) speakText('Sistemler nominal efendim.');
                }}
              />
              <h2 className="text-sm font-bold font-['Orbitron'] text-cyan-200 mt-2">
                J.A.R.V.I.S. MİNİ WİDGET
              </h2>
              <p className="text-xs text-cyan-400/70 font-mono mt-1">
                Tüm alt sistemler arka planda izleniyor.
              </p>
              <button
                onClick={() => setIsCompact(false)}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-['Orbitron'] flex items-center space-x-2 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              >
                <Maximize className="w-4 h-4" />
                <span>Pencereyi Genişlet</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Full Windows Application Layout */
          <div className="flex-1 overflow-hidden">
            {currentView === 'hud' && (
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
                {/* Left / Center: Holographic Arc Reactor & System Diagnostics */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-[#051022]/80 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,180,255,0.1)] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="font-['Orbitron'] text-xs font-bold text-cyan-200 tracking-wider">
                        ARK REAKTÖRÜ MERKEZİ
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">100% GÜVENLİ</span>
                  </div>

                  {/* Arc Reactor Centerpiece */}
                  <ArcReactorHUD
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    onPulseCore={() => {
                      playCommandSuccess();
                      if (voiceEnabledState) {
                        speakText('Ark Reaktörü çekirdeği taze element sentezi ile yüzde yüz kapasitede çalışıyor efendim.');
                      }
                    }}
                  />

                  {/* Quick Hub Navigation Cards */}
                  <div className="grid grid-cols-3 gap-2 mt-4 font-mono text-xs">
                    <button
                      onClick={() => setCurrentView('smarthome')}
                      className="p-2.5 rounded-lg bg-[#071936] hover:bg-cyan-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-cyan-400/70">AKILLI EV</div>
                      <div className="font-bold text-cyan-200 mt-0.5">12 Cihaz</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('files')}
                      className="p-2.5 rounded-lg bg-[#071936] hover:bg-amber-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-amber-400/70">DOSYALAR</div>
                      <div className="font-bold text-amber-200 mt-0.5">C: D: Z:</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('transfer')}
                      className="p-2.5 rounded-lg bg-[#071936] hover:bg-sky-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-sky-400/70">AKTARIM</div>
                      <div className="font-bold text-sky-200 mt-0.5">1.4 GB/s</div>
                    </button>
                  </div>
                </div>

                {/* Right: J.A.R.V.I.S. AI & Voice Assistant Console */}
                <div className="lg:col-span-7 h-full overflow-hidden">
                  <JarvisConsole
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isAiLoading}
                    voiceEnabled={voiceEnabledState}
                    onExecuteAction={handleExecuteAction}
                    onNavigateView={(v) => setCurrentView(v)}
                    onVoiceStateChange={(listening) => setIsListening(listening)}
                  />
                </div>
              </div>
            )}

            {currentView === 'smarthome' && (
              <SmartHomeView
                devices={smartDevices}
                onUpdateDevice={handleUpdateSmartDevice}
                onAddDevice={handleAddSmartDevice}
                onApplyScene={handleApplyScene}
              />
            )}

            {currentView === 'files' && (
              <FileExplorerView
                files={filesList}
                onUploadFile={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                onSendToTransfer={handleSendToTransfer}
                onJarvisAnalyze={handleJarvisAnalyzeFile}
              />
            )}

            {currentView === 'transfer' && (
              <DataTransferView
                transfers={transfers}
                onStartTransfer={handleStartTransfer}
                onUpdateTransfer={handleUpdateTransfer}
                onEmergencyDataDump={handleEmergencyDataDump}
              />
            )}
          </div>
        )}

        {/* Stark Start Menu Popup */}
        {showStartMenu && (
          <div className="absolute bottom-12 left-3 w-80 bg-[#06142a]/95 backdrop-blur-xl border border-cyan-400/50 rounded-xl p-4 shadow-[0_0_30px_rgba(0,210,255,0.25)] z-50 text-xs font-mono">
            <div className="flex items-center space-x-3 pb-3 border-b border-cyan-500/30">
              <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 font-['Orbitron']">TONY STARK</div>
                <div className="text-[10px] text-cyan-400/70">Baş Mühendis & İcra Kurulu Başkanı</div>
              </div>
            </div>

            <div className="py-2 space-y-1">
              <button
                onClick={() => {
                  setCurrentView('hud');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>💠</span>
                <span>J.A.R.V.I.S. Ana Kontrol Ekranı</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('smarthome');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>🏠</span>
                <span>Malibu Akıllı Ev Otomasyonu</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('files');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>📁</span>
                <span>Windows & Stark Dosya Gezgini</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('transfer');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Kuantum Veri Aktarımı Hub</span>
              </button>
            </div>

            <div className="pt-2 border-t border-cyan-500/30 flex justify-between text-[10px] text-slate-400">
              <span>Windows 11 Stark OS</span>
              <button
                onClick={() => setShowStartMenu(false)}
                className="text-cyan-400 hover:text-cyan-200 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Windows Bottom Telemetry & Taskbar */}
      <SystemTelemetryBar
        onStartMenuClick={() => setShowStartMenu(!showStartMenu)}
        arcOutput={3200}
      />
    </div>
  );
}
