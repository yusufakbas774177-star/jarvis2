import React, { useState } from 'react';
import { 
  Languages, 
  Mail, 
  Calculator, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  Volume2, 
  Sliders, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Tv, 
  Briefcase 
} from 'lucide-react';
import { playCommandSuccess, playChirp } from '../utils/soundEffects';
import { speakText } from '../utils/speech';

interface AiToolsViewProps {
  onApplyScene: (sceneName: string) => void;
  onSaveNote?: (title: string, content: string) => void;
  isMobile?: boolean;
}

export const AiToolsView: React.FC<AiToolsViewProps> = ({
  onApplyScene,
  onSaveNote,
  isMobile = false
}) => {
  const [activeTab, setActiveTab] = useState<'translate' | 'writer' | 'calc' | 'routines'>('translate');

  // Translation state
  const [sourceLang, setSourceLang] = useState('tr');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedTranslate, setCopiedTranslate] = useState(false);

  // Writer state
  const [writerTopic, setWriterTopic] = useState('');
  const [writerType, setWriterType] = useState<'email' | 'meeting' | 'thanks' | 'report'>('email');
  const [writerTone, setWriterTone] = useState<'formal' | 'friendly' | 'direct'>('formal');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Unit Converter state
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');
  const [convertType, setConvertType] = useState<'bytes' | 'temp' | 'length'>('bytes');
  const [convertVal, setConvertVal] = useState<number>(1024);

  // Translation function
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    playChirp(1100);

    const langNames: Record<string, string> = {
      tr: 'Türkçe',
      en: 'İngilizce',
      de: 'Almanca',
      es: 'İspanyolca',
      fr: 'Fransızca',
      ru: 'Rusça',
      ja: 'Japonca',
      ar: 'Arapça'
    };

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Lütfen şu metni sadece ve doğrudan ${langNames[sourceLang]} dilinden ${langNames[targetLang]} diline çevir, fazladan açıklama ekleme:\n"${sourceText}"`
        })
      });
      const data = await res.json();
      setTranslatedText(data.speechText || 'Çeviri tamamlandı.');
      playCommandSuccess();
    } catch {
      setTranslatedText(`[Çeviri Simülasyonu - ${langNames[targetLang]}]: ${sourceText}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    playChirp(900);
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Draft generator function
  const handleGenerateDraft = async () => {
    if (!writerTopic.trim()) return;
    setIsDrafting(true);
    playChirp(1200);

    const typeLabels = {
      email: 'Resmi Profesyonel İş E-Postası',
      meeting: 'Toplantı Özeti ve Karar Maddeleri',
      thanks: 'Nezaket ve Teşekkür Yazısı',
      report: 'Durum ve Proje İlerleme Raporu'
    };

    const toneLabels = {
      formal: 'Kurumsal, saygılı ve profesyonel',
      friendly: 'Samimi ve işbirlikçi',
      direct: 'Net, kısa ve doğrudan aksiyon odaklı'
    };

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Bir yapay zeka yazar asistanı olarak şu konuda bir ${typeLabels[writerType]} yaz. Ton: ${toneLabels[writerTone]}. Konu detayı: "${writerTopic}". Başlık, hitap ve imza kısımlarını eksiksiz hazırla.`
        })
      });
      const data = await res.json();
      setGeneratedDraft(data.speechText || 'Taslak oluşturuldu.');
      playCommandSuccess();
    } catch {
      setGeneratedDraft(`Sayın İlgili,\n\n"${writerTopic}" konusundaki bilgilendirme ve çalışma detayları aşağıda özetlenmiştir.\n\nSaygılarımla,\nJ.A.R.V.I.S. Asistanı`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Calculate expression
  const handleEvalMath = () => {
    try {
      // Safe sanitized arithmetic evaluation
      const sanitized = calcInput.replace(/[^0-9+\-*/().% ]/g, '');
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcResult(String(res));
      playCommandSuccess();
    } catch {
      setCalcResult('Hatalı İfade');
    }
  };

  return (
    <div id="jarvis-ai-tools-view" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Header Card */}
      <div className="bg-[#061226]/85 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,180,255,0.1)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-['Orbitron'] text-cyan-200 tracking-wide flex items-center gap-2">
              <span>YAPAY ZEKA ÇOK AMAÇLI ARAÇLAR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                PRO SÜRÜM
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Çok dilli çevirmen, yapay zeka e-posta yazarı, birim dönüştürücü ve otomasyon rutinleri.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[#09152b] p-1 rounded-lg border border-cyan-500/30 text-xs font-mono">
          <button
            onClick={() => { playChirp(900); setActiveTab('translate'); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'translate' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Çevirmen</span>
          </button>
          <button
            onClick={() => { playChirp(900); setActiveTab('writer'); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'writer' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Metin & E-Posta</span>
          </button>
          <button
            onClick={() => { playChirp(900); setActiveTab('calc'); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'calc' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Hesap & Birim</span>
          </button>
          <button
            onClick={() => { playChirp(900); setActiveTab('routines'); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'routines' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Rutinler</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Translation */}
      {activeTab === 'translate' && (
        <div className="bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/25 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-[#09152b] border border-cyan-500/40 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
              >
                <option value="tr">Türkçe</option>
                <option value="en">İngilizce</option>
                <option value="de">Almanca</option>
                <option value="es">İspanyolca</option>
                <option value="fr">Fransızca</option>
                <option value="ru">Rusça</option>
                <option value="ja">Japonca</option>
                <option value="ar">Arapça</option>
              </select>

              <button
                onClick={handleSwapLanguages}
                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 cursor-pointer"
                title="Dilleri Değiştir"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-[#09152b] border border-cyan-500/40 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
              >
                <option value="en">İngilizce</option>
                <option value="tr">Türkçe</option>
                <option value="de">Almanca</option>
                <option value="es">İspanyolca</option>
                <option value="fr">Fransızca</option>
                <option value="ru">Rusça</option>
                <option value="ja">Japonca</option>
                <option value="ar">Arapça</option>
              </select>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {isTranslating ? 'Çevriliyor...' : 'J.A.R.V.I.S. ile Çevir'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">KAYNAK METİN</label>
              <textarea
                rows={6}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Çevirmek istediğiniz metni yazın veya yapıştırın..."
                className="w-full bg-[#030814]/80 border border-cyan-500/30 rounded-xl p-3 text-cyan-100 font-sans text-sm focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-slate-400">ÇEVİRİ SONUCU</label>
                {translatedText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(translatedText)}
                      className="text-cyan-400 hover:text-cyan-200 text-xs flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Seslendir
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText);
                        setCopiedTranslate(true);
                        setTimeout(() => setCopiedTranslate(false), 2000);
                      }}
                      className="text-cyan-400 hover:text-cyan-200 text-xs flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedTranslate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTranslate ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full h-[152px] bg-[#030814]/80 border border-cyan-500/30 rounded-xl p-3 text-cyan-100 font-sans text-sm overflow-y-auto">
                {translatedText || (
                  <span className="text-slate-500 italic">Çeviri burada görünecektir.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Writer */}
      {activeTab === 'writer' && (
        <div className="bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/25 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">YAZI TÜRÜ</label>
              <select
                value={writerType}
                onChange={(e) => setWriterType(e.target.value as any)}
                className="w-full bg-[#09152b] border border-cyan-500/40 text-cyan-200 px-3 py-2 rounded-lg text-xs font-mono outline-none"
              >
                <option value="email">Resmi İş E-Postası</option>
                <option value="meeting">Toplantı Karar Maddeleri</option>
                <option value="thanks">Nezaket ve Teşekkür</option>
                <option value="report">Proje Durum Raporu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">ÜSLUP / TON</label>
              <select
                value={writerTone}
                onChange={(e) => setWriterTone(e.target.value as any)}
                className="w-full bg-[#09152b] border border-cyan-500/40 text-cyan-200 px-3 py-2 rounded-lg text-xs font-mono outline-none"
              >
                <option value="formal">Kurumsal & Saygılı</option>
                <option value="friendly">Samimi & İşbirlikçi</option>
                <option value="direct">Kısa & Net (Özet)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateDraft}
                disabled={isDrafting || !writerTopic.trim()}
                className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              >
                {isDrafting ? 'Oluşturuluyor...' : 'Taslağı Yaz'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">KONU VE DETAYLAR</label>
            <input
              type="text"
              value={writerTopic}
              onChange={(e) => setWriterTopic(e.target.value)}
              placeholder="Örn: Haftaya yapılacak bütçe toplantısının ertelenmesi ve yeni tarih önerisi"
              className="w-full bg-[#030814]/80 border border-cyan-500/30 rounded-xl px-3 py-2 text-cyan-100 font-sans text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {generatedDraft && (
            <div className="space-y-2 pt-2 border-t border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300 font-bold">HAZIRLANAN METİN</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDraft);
                      setCopiedDraft(true);
                      setTimeout(() => setCopiedDraft(false), 2000);
                    }}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDraft ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                  {onSaveNote && (
                    <button
                      onClick={() => {
                        onSaveNote(writerTopic || 'AI Taslağı', generatedDraft);
                        playCommandSuccess();
                        speakText('Taslak not defterinize eklendi efendim.');
                      }}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Notlara Ekle</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-[#030814]/80 border border-cyan-500/30 rounded-xl p-4 text-cyan-100 font-sans text-sm whitespace-pre-line leading-relaxed">
                {generatedDraft}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Calculator & Unit Converter */}
      {activeTab === 'calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Math Evaluator */}
          <div className="bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/25 p-5 space-y-3">
            <h3 className="text-xs font-bold font-['Orbitron'] text-cyan-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>HIZLI FORMÜL HESAPLAYICI</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Toplama, çıkarma, çarpma, bölme veya yüzde hesapları yapın.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                placeholder="Örn: (1450 * 1.20) / 12"
                className="flex-1 bg-[#030814] border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
                onKeyDown={(e) => { if (e.key === 'Enter') handleEvalMath(); }}
              />
              <button
                onClick={handleEvalMath}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs rounded-lg cursor-pointer"
              >
                Hesapla
              </button>
            </div>

            {calcResult && (
              <div className="p-3 bg-[#030814] border border-cyan-500/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">SONUÇ:</span>
                <span className="text-lg font-bold font-['Orbitron'] text-emerald-300">{calcResult}</span>
              </div>
            )}
          </div>

          {/* Unit Converter */}
          <div className="bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/25 p-5 space-y-3">
            <h3 className="text-xs font-bold font-['Orbitron'] text-cyan-200 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              <span>DİJİTAL VERİ VE BİRİM DÖNÜŞTÜRÜCÜ</span>
            </h3>

            <div className="flex gap-2">
              <select
                value={convertType}
                onChange={(e) => setConvertType(e.target.value as any)}
                className="bg-[#09152b] border border-cyan-500/40 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
              >
                <option value="bytes">Veri Depolama (MB / GB / TB)</option>
                <option value="temp">Sıcaklık (°C / °F)</option>
                <option value="length">Uzunluk (Metre / Fit)</option>
              </select>

              <input
                type="number"
                value={convertVal}
                onChange={(e) => setConvertVal(Number(e.target.value))}
                className="w-28 bg-[#030814] border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-cyan-100 font-mono outline-none"
              />
            </div>

            <div className="p-3 bg-[#030814] border border-cyan-500/30 rounded-lg text-xs font-mono space-y-1 text-slate-300">
              {convertType === 'bytes' && (
                <>
                  <div>• {convertVal} Megabayt (MB) = <strong className="text-cyan-300">{(convertVal / 1024).toFixed(3)} Gigabayt (GB)</strong></div>
                  <div>• {convertVal} Megabayt (MB) = <strong className="text-cyan-300">{(convertVal / (1024 * 1024)).toFixed(5)} Terabayt (TB)</strong></div>
                  <div>• {convertVal} Megabayt (MB) = <strong className="text-cyan-300">{(convertVal * 1024).toLocaleString()} Kilobayt (KB)</strong></div>
                </>
              )}
              {convertType === 'temp' && (
                <>
                  <div>• {convertVal}°C = <strong className="text-cyan-300">{((convertVal * 9/5) + 32).toFixed(1)}°F (Fahrenheit)</strong></div>
                  <div>• {convertVal}°C = <strong className="text-cyan-300">{(convertVal + 273.15).toFixed(2)} K (Kelvin)</strong></div>
                </>
              )}
              {convertType === 'length' && (
                <>
                  <div>• {convertVal} Metre = <strong className="text-cyan-300">{(convertVal * 3.28084).toFixed(2)} Fit (ft)</strong></div>
                  <div>• {convertVal} Metre = <strong className="text-cyan-300">{(convertVal / 1000).toFixed(3)} Kilometre (km)</strong></div>
                  <div>• {convertVal} Metre = <strong className="text-cyan-300">{(convertVal * 0.000621371).toFixed(4)} Mil (mi)</strong></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Routines and Automated Protocols */}
      {activeTab === 'routines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => {
              playCommandSuccess();
              onApplyScene('morning');
              speakText('Günaydın efendim. Aydınlatmalar açıldı, iklimlendirme 23 dereceye ayarlandı.');
            }}
            className="p-4 rounded-xl bg-[#071936]/80 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.1)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-['Orbitron'] text-amber-200">GÜNAYDIN RUTİNİ</h4>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Gün ışığı aydınlatması, 23°C ortam sıcaklığı ve günlük brifing.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-400 font-bold">▶ Çalıştır</div>
          </div>

          <div 
            onClick={() => {
              playCommandSuccess();
              onApplyScene('cinema');
              speakText('Sinema modu devrede efendim. Işıklar kısıldı.');
            }}
            className="p-4 rounded-xl bg-[#071936]/80 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.1)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-['Orbitron'] text-purple-200">SİNEMA AMBİYANSI</h4>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Loş ışıklar (%20), multimedya ve ses sistemleri hazır.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-400 font-bold">▶ Çalıştır</div>
          </div>

          <div 
            onClick={() => {
              playCommandSuccess();
              onApplyScene('lab_focus');
              speakText('Çalışma modu aktif edildi efendim.');
            }}
            className="p-4 rounded-xl bg-[#071936]/80 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.1)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-['Orbitron'] text-cyan-200">ODAKLANMA / ÇALIŞMA</h4>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Beyaz çalışma aydınlatması (%100), rahatsız etmeme modu.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-400 font-bold">▶ Çalıştır</div>
          </div>

          <div 
            onClick={() => {
              playCommandSuccess();
              onApplyScene('night_stealth');
              speakText('İyi geceler efendim. Tüm kapılar kilitlendi ve ışıklar kapatıldı.');
            }}
            className="p-4 rounded-xl bg-[#071936]/80 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,255,0.1)] group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 mb-3 group-hover:scale-105 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-['Orbitron'] text-rose-200">GECE PROTOKOLÜ</h4>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Tüm aydınlatmalar kapalı, kapı kilitleri devrede, termostat 20°C.
            </p>
            <div className="mt-3 text-[11px] font-mono text-rose-400 font-bold">▶ Çalıştır</div>
          </div>
        </div>
      )}
    </div>
  );
};
