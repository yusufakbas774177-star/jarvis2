import React, { useState } from 'react';
import { AssistantNote } from '../types';
import { 
  FileText, 
  Mic, 
  MicOff, 
  Sparkles, 
  Download, 
  Copy, 
  Trash2, 
  Plus, 
  Volume2, 
  Check, 
  Search,
  Tag
} from 'lucide-react';
import { playCommandSuccess, playChirp } from '../utils/soundEffects';
import { speakText, startSpeechRecognition } from '../utils/speech';

interface NotesViewProps {
  notes: AssistantNote[];
  onAddNote: (note: AssistantNote) => void;
  onUpdateNote: (note: AssistantNote) => void;
  onDeleteNote: (id: string) => void;
  isMobile?: boolean;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  isMobile = false
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // New Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Genel, Asistan');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const note: AssistantNote = {
      id: `note_${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean)
    };

    onAddNote(note);
    setSelectedNoteId(note.id);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    playCommandSuccess();
  };

  const handleStartVoiceDictation = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    playChirp(1200);
    setIsRecording(true);

    startSpeechRecognition(
      (transcript) => {
        setIsRecording(false);
        if (activeNote) {
          const updatedContent = activeNote.content 
            ? `${activeNote.content}\n${transcript}` 
            : transcript;
          onUpdateNote({ ...activeNote, content: updatedContent });
          playCommandSuccess();
        } else {
          // Create new note with transcript
          const note: AssistantNote = {
            id: `note_${Date.now()}`,
            title: `Sesli Dikte - ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
            content: transcript,
            date: new Date().toLocaleDateString('tr-TR'),
            tags: ['Sesli Dikte', 'Otomatik']
          };
          onAddNote(note);
          setSelectedNoteId(note.id);
        }
      },
      () => {
        setIsRecording(false);
      }
    );
  };

  const handleCopyNote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playChirp(1300);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadNote = (note: AssistantNote) => {
    playCommandSuccess();
    const content = `# ${note.title}\nTarih: ${note.date}\nEtiketler: ${note.tags.join(', ')}\n\n${note.content}\n\n${note.summary ? `### J.A.R.V.I.S. Özeti:\n${note.summary}` : ''}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJarvisSummarize = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsSummarizing(true);
    playChirp(1100);

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Lütfen şu notu 2-3 maddelik çok net ve profesyonel bir özet haline getir:\n"${activeNote.content}"`
        })
      });
      const data = await res.json();
      const summaryText = data.speechText || 'Not ana hatlarıyla kaydedildi.';
      onUpdateNote({ ...activeNote, summary: summaryText });
      playCommandSuccess();
      speakText('Not özetiniz hazırlandı efendim.');
    } catch {
      onUpdateNote({
        ...activeNote,
        summary: `• Ana konu: ${activeNote.title}\n• Not içeriği gözden geçirildi ve arşivlendi.`
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div id="jarvis-notes-view" className="h-full flex flex-col p-4 space-y-4 overflow-hidden">
      {/* Top Header Card */}
      <div className="bg-[#061226]/85 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,180,255,0.1)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-['Orbitron'] text-cyan-200 tracking-wide flex items-center gap-2">
              <span>SESLİ NOT DEFTERİ & DİKTE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                YAPAY ZEKA ENTEGRE
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Konuşarak not alın, J.A.R.V.I.S. ile özetleyin ve cihazınıza kaydedin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Dictate Button */}
          <button
            onClick={handleStartVoiceDictation}
            className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
              isRecording
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-400/50 text-cyan-300'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? 'Dinliyor (Konuşun)...' : 'Sesli Dikte Başlat'}</span>
          </button>

          {/* New Note Button */}
          <button
            onClick={() => {
              playChirp(1200);
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Not</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Notes List on Left, Active Editor on Right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left Side: Notes Sidebar */}
        <div className="md:col-span-4 bg-[#051124]/80 backdrop-blur-md rounded-xl border border-cyan-500/25 p-3 flex flex-col space-y-3 overflow-hidden">
          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Notlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030914] border border-cyan-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                Not bulunamadı
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    playChirp(900);
                    setSelectedNoteId(note.id);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    activeNote?.id === note.id
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'bg-[#081836]/50 border-cyan-500/20 hover:border-cyan-400/40 hover:bg-[#081836]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-cyan-200 font-['Orbitron'] truncate flex-1">
                      {note.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {note.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-sans">
                    {note.content || '(İçerik boş)'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400/80 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Note Viewer & AI Summary */}
        <div className="md:col-span-8 bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/25 p-4 flex flex-col space-y-3 overflow-y-auto min-h-0">
          {activeNote ? (
            <>
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20 shrink-0">
                <div>
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => onUpdateNote({ ...activeNote, title: e.target.value })}
                    className="text-base font-bold font-['Orbitron'] text-cyan-200 bg-transparent border-b border-transparent hover:border-cyan-500/40 focus:border-cyan-400 outline-none w-full"
                  />
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                    <span>{activeNote.date}</span>
                    <span>•</span>
                    <span>{activeNote.content.length} karakter</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => speakText(`${activeNote.title}. ${activeNote.content}`)}
                    className="p-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
                    title="Sesli Oku"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyNote(activeNote.content, activeNote.id)}
                    className="p-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
                    title="Panoya Kopyala"
                  >
                    {copiedId === activeNote.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDownloadNote(activeNote)}
                    className="p-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
                    title="Dosya Olarak İndir (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      playChirp(600);
                      onDeleteNote(activeNote.id);
                    }}
                    className="p-2 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                    title="Notu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content Textarea */}
              <div className="flex-1 flex flex-col min-h-[160px]">
                <textarea
                  value={activeNote.content}
                  onChange={(e) => onUpdateNote({ ...activeNote, content: e.target.value })}
                  placeholder="Notunuzu buraya yazın veya sesli dikte butonunu kullanın..."
                  className="w-full flex-1 p-3 bg-[#030814]/70 border border-cyan-500/20 rounded-xl text-cyan-100 font-sans text-sm leading-relaxed focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* J.A.R.V.I.S. AI Summary Section */}
              <div className="bg-[#071936]/80 rounded-xl border border-cyan-500/30 p-3.5 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold font-['Orbitron'] text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>J.A.R.V.I.S. NÖRAL ANALİZİ & ÖZET</span>
                  </div>
                  <button
                    onClick={handleJarvisSummarize}
                    disabled={isSummarizing || !activeNote.content.trim()}
                    className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSummarizing ? 'Özet Çıkarılıyor...' : 'Yapay Zeka ile Özetle'}
                  </button>
                </div>

                {activeNote.summary ? (
                  <div className="p-2.5 rounded-lg bg-[#040e21] border border-cyan-500/20 text-xs text-cyan-100 font-sans whitespace-pre-line">
                    {activeNote.summary}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-sans italic">
                    Notun anahtar noktalarını ve maddeli özetini çıkarmak için yukarıdaki butona tıklayın.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
              Görüntülemek için soldan bir not seçin veya yeni not oluşturun.
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#07162e] border-2 border-cyan-400/80 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,229,255,0.3)]">
            <h3 className="text-base font-bold font-['Orbitron'] text-cyan-200 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>YENİ ASİSTAN NOTU</span>
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">NOT BAŞLIĞI</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Haftalık Strateji Planı"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">İÇERİK</label>
                <textarea
                  rows={4}
                  placeholder="Not metnini yazın..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ETİKETLER (Virgülle ayırın)</label>
                <input
                  type="text"
                  placeholder="Örn: Proje, Toplantı, Fikirler"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
