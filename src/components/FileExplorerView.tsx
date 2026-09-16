import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  HardDrive, 
  Search, 
  ArrowLeft, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Eye, 
  Sparkles, 
  Radio, 
  X, 
  FolderOpen
} from 'lucide-react';
import { FileItem } from '../types';
import { playChirp, playCommandSuccess, playAlert } from '../utils/soundEffects';

interface FileExplorerViewProps {
  files: FileItem[];
  onUploadFile: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onSendToTransfer: (file: FileItem) => void;
  onJarvisAnalyze: (file: FileItem) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files,
  onUploadFile,
  onDeleteFile,
  onSendToTransfer,
  onJarvisAnalyze
}) => {
  const [selectedDrive, setSelectedDrive] = useState<'C:' | 'D:' | 'Z:' | 'LOCAL:'>('C:');
  const [currentPath, setCurrentPath] = useState<string>('C:\\');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [realFilesList, setRealFilesList] = useState<FileItem[]>([]);
  const [localDirName, setLocalDirName] = useState<string>('');
  const [newFileModalOpen, setNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');
  const [newFileContent, setNewFileContent] = useState('');

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const drives = [
    { id: 'C:', name: 'Yerel Disk (C:)', desc: 'Windows İşletim Sistemi & Belgeler', icon: <HardDrive className="w-4 h-4 text-cyan-400" /> },
    { id: 'D:', name: 'Veri Deposu (D:)', desc: 'Kullanıcı Verileri & Arşiv', icon: <HardDrive className="w-4 h-4 text-amber-400" /> },
    { id: 'Z:', name: 'Güvenli Ağ (Z:)', desc: 'Bulut Yedekleme & Ağ Paylaşımı', icon: <HardDrive className="w-4 h-4 text-emerald-400" /> },
    { id: 'LOCAL:', name: localDirName ? `Yerel: ${localDirName}` : 'Bilgisayardan Klasör Aç...', desc: 'Bilgisayarınızdan gerçek bir klasör seçin', icon: <FolderOpen className="w-4 h-4 text-sky-400" /> }
  ];

  // Native Web File System Access API support: Open Real Computer Folder!
  const handleOpenLocalDirectory = async () => {
    playChirp(1200);
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setLocalDirName(dirHandle.name);
        setSelectedDrive('LOCAL:');
        setCurrentPath(`LOCAL:\\${dirHandle.name}`);

        const loadedItems: FileItem[] = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const fileData = await entry.getFile();
            let contentText = '';
            if (fileData.size < 500000) {
              try {
                contentText = await fileData.text();
              } catch (e) {
                contentText = '[İkili / Medya Verisi]';
              }
            }
            loadedItems.push({
              id: `real_${Date.now()}_${Math.random()}`,
              name: entry.name,
              path: `LOCAL:\\${dirHandle.name}\\${entry.name}`,
              drive: 'LOCAL:',
              type: 'file',
              extension: entry.name.split('.').pop() || 'dat',
              size: `${(fileData.size / 1024).toFixed(1)} KB`,
              sizeBytes: fileData.size,
              modified: new Date(fileData.lastModified).toISOString().slice(0, 16).replace('T', ' '),
              content: contentText,
              securityClearance: 'Level 1'
            });
          } else if (entry.kind === 'directory') {
            loadedItems.push({
              id: `real_dir_${Date.now()}_${Math.random()}`,
              name: entry.name,
              path: `LOCAL:\\${dirHandle.name}\\${entry.name}`,
              drive: 'LOCAL:',
              type: 'folder',
              size: '<KLASÖR>',
              sizeBytes: 0,
              modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
              securityClearance: 'Level 1'
            });
          }
        }
        setRealFilesList(loadedItems);
        playCommandSuccess();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Directory Picker Error:', err);
        }
      }
    } else {
      // Fallback: trigger file input
      if (hiddenFileInputRef.current) {
        hiddenFileInputRef.current.click();
      }
    }
  };

  // Real File Upload Handler (Drag & Drop or File Picker)
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    playChirp(1300);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      let content = '';
      if (file.size < 500000) {
        try {
          content = await file.text();
        } catch (e) {
          content = '[Binary Dosya İçeriği]';
        }
      }

      const newItem: FileItem = {
        id: `upload_${Date.now()}_${i}`,
        name: file.name,
        path: `${currentPath}${file.name}`,
        drive: selectedDrive,
        type: 'file',
        extension: file.name.split('.').pop() || 'dat',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        sizeBytes: file.size,
        modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
        securityClearance: 'Level 1',
        content
      };

      if (selectedDrive === 'LOCAL:') {
        setRealFilesList((prev) => [newItem, ...prev]);
      } else {
        onUploadFile(newItem);
      }
    }
    playCommandSuccess();
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.value = '';
    }
  };

  // Real File Download Handler (Saves to user's computer disk)
  const handleDownloadFile = (file: FileItem) => {
    playCommandSuccess();
    const blob = new Blob([file.content || `DOSYA: ${file.name}\nBoyut: ${file.size}`], { 
      type: 'text/plain;charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Resolve directory items
  const getDisplayItems = (): FileItem[] => {
    if (selectedDrive === 'LOCAL:') {
      return realFilesList;
    }

    const driveRoot = files.find((d) => d.drive === selectedDrive);
    if (!driveRoot) return [];

    let items: FileItem[] = [];

    const traverse = (node: FileItem) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.path.startsWith(currentPath)) {
            // Only direct children of current path
            const relative = child.path.slice(currentPath.length).replace(/^[\\\/]/, '');
            if (!relative.includes('\\') && !relative.includes('/')) {
              items.push(child);
            }
          }
          traverse(child);
        });
      }
    };

    if (currentPath === `${selectedDrive}\\`) {
      if (driveRoot.children) {
        items = driveRoot.children;
      }
    } else {
      traverse(driveRoot);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      // Search all items in drive
      const all: FileItem[] = [];
      const collect = (node: FileItem) => {
        if (node.name.toLowerCase().includes(q) && node.id !== driveRoot.id) {
          all.push(node);
        }
        if (node.children) {
          node.children.forEach(collect);
        }
      };
      collect(driveRoot);
      return all;
    }

    return items;
  };

  const currentItems = getDisplayItems();

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newItem: FileItem = {
      id: `custom_${Date.now()}`,
      name: newFileName,
      path: `${currentPath}${newFileName}`,
      drive: selectedDrive,
      type: newFileType,
      extension: newFileType === 'file' ? newFileName.split('.').pop() || 'txt' : undefined,
      size: newFileType === 'folder' ? '<KLASÖR>' : `${(newFileContent.length / 1024).toFixed(1)} KB`,
      sizeBytes: newFileContent.length,
      modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      securityClearance: 'Level 1',
      content: newFileContent,
      children: newFileType === 'folder' ? [] : undefined
    };

    if (selectedDrive === 'LOCAL:') {
      setRealFilesList((prev) => [newItem, ...prev]);
    } else {
      onUploadFile(newItem);
    }

    playCommandSuccess();
    setNewFileModalOpen(false);
    setNewFileName('');
    setNewFileContent('');
  };

  return (
    <div id="file-explorer-view" className="h-full flex flex-col p-4 space-y-3 overflow-hidden">
      {/* Hidden File Input for Real File Uploads */}
      <input
        type="file"
        multiple
        ref={hiddenFileInputRef}
        onChange={handleRealFileUpload}
        className="hidden"
      />

      {/* Explorer Top Bar: Drives & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#06142a]/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 gap-3">
        {/* Drive Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {drives.map((d) => {
            const active = selectedDrive === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  if (d.id === 'LOCAL:' && !localDirName) {
                    handleOpenLocalDirectory();
                  } else {
                    playChirp(1100);
                    setSelectedDrive(d.id as any);
                    setCurrentPath(d.id === 'LOCAL:' ? `LOCAL:\\${localDirName}` : `${d.id}\\`);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-[#091a35] text-slate-400 hover:text-cyan-200 border border-cyan-500/10'
                }`}
              >
                {d.icon}
                <span className="font-bold font-['Rajdhani']">{d.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Upload, Real Folder, Create */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-open-real-pc-folder"
            onClick={handleOpenLocalDirectory}
            title="Bilgisayarınızdaki gerçek klasörü seçin ve gezinin"
            className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-500/40 text-sky-200 border border-sky-400/50 text-xs font-mono flex items-center space-x-1.5 cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.2)]"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-300" />
            <span>Bilgisayardan Klasör Aç</span>
          </button>

          <button
            id="btn-upload-file-pc"
            onClick={() => {
              playChirp(1200);
              hiddenFileInputRef.current?.click();
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Dosya Yükle</span>
          </button>

          <button
            id="btn-create-file-modal"
            onClick={() => {
              playChirp(1200);
              setNewFileModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Dosya</span>
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs & Search Bar */}
      <div className="flex items-center justify-between bg-[#081830] p-2.5 rounded-lg border border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center space-x-2 text-cyan-300">
          <button
            onClick={() => {
              playChirp(950);
              setCurrentPath(`${selectedDrive}\\`);
            }}
            title="Kök Dizine Dön"
            className="p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-cyan-400 font-bold">{currentPath}</span>
        </div>

        <div className="relative w-48 md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Disk içinde ara..."
            className="w-full bg-[#040e20] border border-cyan-500/30 rounded-md pl-7 pr-2 py-1 text-xs text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>
      </div>

      {/* Files List & Grid Container */}
      <div className="flex-1 bg-[#051124]/90 backdrop-blur-md rounded-xl border border-cyan-500/30 overflow-y-auto p-4">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 text-xs font-mono space-y-2">
            <Folder className="w-10 h-10 text-cyan-900" />
            <p>Bu dizinde dosya bulunmuyor veya arama kriterine uymuyor.</p>
            <button
              onClick={() => hiddenFileInputRef.current?.click()}
              className="text-cyan-400 underline hover:text-cyan-200 cursor-pointer"
            >
              Bilgisayarınızdan bir dosya yükleyin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentItems.map((item) => {
              const isFolder = item.type === 'folder';
              return (
                <div
                  key={item.id}
                  id={`file-item-${item.id}`}
                  onDoubleClick={() => {
                    if (isFolder) {
                      playChirp(1300);
                      setCurrentPath(`${item.path}\\`);
                    } else {
                      playChirp(1100);
                      setPreviewFile(item);
                    }
                  }}
                  className="flex flex-col justify-between p-3 rounded-lg bg-[#071936]/80 hover:bg-[#0b244d] border border-cyan-500/20 hover:border-cyan-400/60 transition-all duration-200 cursor-pointer group shadow-[0_0_10px_rgba(0,180,255,0.05)]"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded bg-cyan-950/70 border border-cyan-500/30 shrink-0">
                      {isFolder ? (
                        <Folder className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                      ) : item.extension === 'json' || item.extension === 'cfg' ? (
                        <FileCode className="w-6 h-6 text-rose-400" />
                      ) : item.extension === 'py' || item.extension === 'js' || item.extension === 'ts' ? (
                        <FileCode className="w-6 h-6 text-emerald-400" />
                      ) : item.extension === 'csv' || item.extension === 'xlsx' ? (
                        <FileSpreadsheet className="w-6 h-6 text-sky-400" />
                      ) : (
                        <FileText className="w-6 h-6 text-cyan-300" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-cyan-100 truncate group-hover:text-cyan-300 font-sans">
                        {item.name}
                      </h4>
                      <div className="text-[10px] text-cyan-400/60 font-mono mt-0.5">
                        {item.size} • {item.modified}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Files */}
                  {!isFolder && (
                    <div className="mt-3 pt-2 border-t border-cyan-500/15 flex items-center justify-between text-xs text-cyan-400/80">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playChirp(1000);
                            setPreviewFile(item);
                          }}
                          title="Önizle"
                          className="p-1 rounded hover:bg-cyan-500/20 hover:text-cyan-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(item);
                          }}
                          title="Bilgisayara İndir"
                          className="p-1 rounded hover:bg-cyan-500/20 hover:text-cyan-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playCommandSuccess();
                            onSendToTransfer(item);
                          }}
                          title="Veri Aktarım Kuyruğuna Gönder"
                          className="p-1 rounded hover:bg-cyan-500/20 hover:text-cyan-200 cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playChirp(1200);
                            onJarvisAnalyze(item);
                          }}
                          title="J.A.R.V.I.S. ile Analiz Et"
                          className="p-1 rounded hover:bg-cyan-500/20 hover:text-cyan-200 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAlert();
                          onDeleteFile(item.id);
                        }}
                        title="Sil"
                        className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#06142a] border border-cyan-400/60 rounded-xl flex flex-col max-h-[85vh] shadow-[0_0_40px_rgba(0,210,255,0.25)]">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200">
                    {previewFile.name}
                  </h3>
                  <span className="text-[10px] text-cyan-400/60 font-mono">
                    {previewFile.path} • {previewFile.size}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content view */}
            <div className="p-4 overflow-y-auto font-mono text-xs text-cyan-100 bg-[#030a17] flex-1 select-text">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {previewFile.content || `[İçerik Görüntülenemiyor / İkili Dosya]\nBoyut: ${previewFile.size}`}
              </pre>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-cyan-500/30 flex items-center justify-between bg-[#081830]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Bilgisayara İndir</span>
                </button>

                <button
                  onClick={() => {
                    onSendToTransfer(previewFile);
                    setPreviewFile(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Veri Aktarımına Ekle</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onJarvisAnalyze(previewFile);
                  setPreviewFile(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>J.A.R.V.I.S. ile Analiz Et</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File / Folder Modal */}
      {newFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071732] border border-cyan-400/50 rounded-xl p-5 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-200">
                YENİ DOSYA / KLASÖR OLUŞTUR
              </h3>
              <button
                onClick={() => setNewFileModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3 mt-3 text-xs font-mono">
              <div>
                <label className="block text-cyan-300 mb-1">Tür:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFileType('file')}
                    className={`py-2 rounded border flex items-center justify-center space-x-2 cursor-pointer ${
                      newFileType === 'file' 
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Dosya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFileType('folder')}
                    className={`py-2 rounded border flex items-center justify-center space-x-2 cursor-pointer ${
                      newFileType === 'folder' 
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Folder className="w-4 h-4" />
                    <span>Klasör</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-cyan-300 mb-1">İsim:</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={newFileType === 'file' ? 'calisma_notu.txt' : 'Yeni_Klasor'}
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {newFileType === 'file' && (
                <div>
                  <label className="block text-cyan-300 mb-1">İçerik:</label>
                  <textarea
                    rows={4}
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    placeholder="Dosya içeriğini buraya yazın..."
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewFileModalOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-['Orbitron'] cursor-pointer"
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
