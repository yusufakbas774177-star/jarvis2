import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Zap,
  Volume2
} from 'lucide-react';
import { ChatMessage, JarvisAction, SystemView } from '../types';
import { playChirp, playCommandSuccess, playAlert } from '../utils/soundEffects';
import { speakText, createSpeechRecognizer, isCurrentlySpeaking, stopSpeaking } from '../utils/speech';

interface JarvisConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  voiceEnabled: boolean;
  onExecuteAction?: (action: JarvisAction) => void;
  onNavigateView: (view: SystemView) => void;
  onVoiceStateChange?: (listening: boolean) => void;
}

export const JarvisConsole: React.FC<JarvisConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  voiceEnabled,
  onExecuteAction,
  onNavigateView,
  onVoiceStateChange
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '💡 Tüm Işıkları Aç', cmd: 'Tüm ev ve atölye ışıklarını aç.' },
    { label: '❄️ Klimayı 22°C Yap', cmd: 'Salon sıcaklığını 22 dereceye ayarla.' },
    { label: '🛡️ Güvenliği Kilitle', cmd: 'Tüm giriş ve laboratuvar kilitlerini aktif et.' },
    { label: '📁 C: Diskini Tara', cmd: 'C: sürücüsündeki sistem ve kullanıcı dosyalarını listele.' },
    { label: '⚡ Kuantum Veri Aktar', cmd: 'Mark 85 zırh verilerini Veronica uydusuna aktar.' },
    { label: '📊 Sistem Raporu', cmd: 'Ark reaktörü ve genel sistem durumunu raporla.' }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle Speech Recognition setup
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      if (onVoiceStateChange) onVoiceStateChange(false);
      playChirp(800);
      return;
    }

    playChirp(1500);
    const recognizer = createSpeechRecognizer(
      'tr-TR',
      (transcript) => {
        setIsListening(false);
        if (onVoiceStateChange) onVoiceStateChange(false);
        if (transcript.trim()) {
          setInputText(transcript);
          onSendMessage(transcript);
        }
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
        if (onVoiceStateChange) onVoiceStateChange(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
        if (onVoiceStateChange) onVoiceStateChange(true);
      } catch (err) {
        console.error('Recognizer start error:', err);
      }
    } else {
      alert('Tarayıcınız ses tanımayı desteklemiyor veya mikrofon izni verilmedi. Lütfen komutlarınızı yazarak iletin.');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    playChirp(1200);
    await onSendMessage(text);
  };

  return (
    <div 
      id="jarvis-console-card" 
      className="flex flex-col h-full bg-[#051021]/90 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,180,255,0.15)] overflow-hidden"
    >
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#081830] border-b border-cyan-500/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Terminal className="w-4 h-4 text-cyan-300" />
          <span className="font-['Orbitron'] text-xs font-bold text-cyan-200 tracking-wider">
            J.A.R.V.I.S. NÖRAL İLETİŞİM PROTOKOLÜ
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-cyan-400/80 font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
            GEMINI-3.8-FLASH AI
          </span>
          <span className="text-emerald-400">● ÇEVRİMİÇİ</span>
        </div>
      </div>

      {/* Message Stream */}
      <div 
        ref={chatScrollRef}
        id="jarvis-chat-stream"
        className="flex-1 p-4 overflow-y-auto space-y-3.5 scroll-smooth"
      >
        {messages.map((msg) => {
          const isJarvis = msg.sender === 'jarvis';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isJarvis ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                {isJarvis ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold text-cyan-300 font-['Orbitron']">J.A.R.V.I.S.</span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-amber-300 font-['Orbitron']">TONY STARK</span>
                    <User className="w-3.5 h-3.5 text-amber-400" />
                  </>
                )}
                <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed font-sans transition-all ${
                  isJarvis
                    ? 'bg-[#091b35] text-cyan-100 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,210,255,0.1)]'
                    : 'bg-[#1e1e38] text-amber-100 border border-amber-500/30'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Voice Replay Button for Jarvis */}
                {isJarvis && (
                  <div className="mt-2 pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                    <button
                      onClick={() => {
                        playChirp(1000);
                        speakText(msg.text);
                      }}
                      className="flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-cyan-200 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Tekrar Dinle</span>
                    </button>
                    <span className="text-[9px] text-cyan-500/60 font-mono">STARK VOICE SYNTH</span>
                  </div>
                )}

                {/* Structured Action Badges */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/30 space-y-1.5">
                    <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider font-['Orbitron']">
                      Yürütülen Sistem İşlemleri:
                    </div>
                    {msg.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded bg-cyan-950/70 border border-cyan-400/30 text-[11px]"
                      >
                        <div className="flex items-center space-x-1.5 text-cyan-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{act.details}</span>
                        </div>
                        {act.type === 'SMART_HOME_CONTROL' && (
                          <button
                            onClick={() => onNavigateView('smarthome')}
                            className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Ev Paneli</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {act.type === 'FILE_OPERATION' && (
                          <button
                            onClick={() => onNavigateView('files')}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Dosyalar</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {act.type === 'DATA_TRANSFER' && (
                          <button
                            onClick={() => onNavigateView('transfer')}
                            className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Aktarım</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 animate-pulse p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
            <span className="font-['Orbitron'] text-[11px]">J.A.R.V.I.S. Nöral Ağları Analiz Ediyor...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Commands */}
      <div 
        id="jarvis-quick-chips" 
        className="px-3 py-2 bg-[#06142a] border-t border-cyan-500/20 flex items-center space-x-1.5 overflow-x-auto"
      >
        <span className="text-[10px] text-cyan-500 font-bold shrink-0 font-['Orbitron']">ÖNERİLER:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              playChirp(1150);
              setInputText(p.cmd);
              onSendMessage(p.cmd);
            }}
            className="text-[10px] whitespace-nowrap px-2 py-1 rounded bg-[#0b2144] hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-100 border border-cyan-500/30 transition-all cursor-pointer font-sans"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Prompt Input Box & Microphone Button */}
      <form 
        onSubmit={handleSend}
        id="jarvis-input-form"
        className="p-3 bg-[#071732] border-t border-cyan-500/30 flex items-center space-x-2"
      >
        <button
          type="button"
          id="btn-voice-mic"
          onClick={toggleListening}
          title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Komut Ver (Mikrofon)'}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer relative ${
            isListening
              ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_#f59e0b]'
              : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
          }`}
        >
          {isListening ? (
            <>
              <div className="absolute inset-0 rounded-lg border border-amber-400 animate-ping opacity-60" />
              <MicOff className="w-4 h-4 text-amber-300" />
            </>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <div className="relative flex-1">
          <input
            id="jarvis-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Sizi dinliyorum efendim...' : "J.A.R.V.I.S.'a bir komut veya soru yazın..."}
            className="w-full bg-[#040f21] border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-600/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans tracking-wide"
          />
        </div>

        <button
          type="submit"
          id="btn-send-command"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.4)]"
        >
          <span className="font-['Orbitron']">İLET</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
