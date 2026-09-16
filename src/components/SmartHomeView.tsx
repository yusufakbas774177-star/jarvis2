import React, { useState } from 'react';
import { 
  Home, 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Unlock, 
  Music, 
  Zap, 
  Plus, 
  Power, 
  Sliders, 
  Check, 
  X, 
  Radio, 
  Sparkles,
  Wind,
  Tv,
  Fan,
  Trash2,
  Cpu,
  RefreshCw,
  Search
} from 'lucide-react';
import { SmartDevice } from '../types';
import { playChirp, playCommandSuccess, playAlert } from '../utils/soundEffects';

interface SmartHomeViewProps {
  devices: SmartDevice[];
  onUpdateDevice: (updated: SmartDevice) => void;
  onAddDevice: (newDevice: SmartDevice) => void;
  onDeleteDevice?: (deviceId: string) => void;
  onApplyScene: (sceneName: string) => void;
}

export const SmartHomeView: React.FC<SmartHomeViewProps> = ({
  devices,
  onUpdateDevice,
  onAddDevice,
  onDeleteDevice,
  onApplyScene
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New device form state
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState('Salon');
  const [newDeviceType, setNewDeviceType] = useState<SmartDevice['type']>('light');
  const [newDeviceIp, setNewDeviceIp] = useState('');
  const [customRoomInput, setCustomRoomInput] = useState('');

  // Collect distinct room list dynamically from user's actual devices
  const existingRooms: string[] = Array.from(new Set(devices.map((d) => d.room).filter(Boolean)));
  const defaultSuggestedRooms = ['Salon', 'Yatak Odası', 'Mutfak', 'Çalışma Odası', 'Banyo', 'Giriş / Koridor'];
  const allRoomsList: string[] = Array.from(new Set([...defaultSuggestedRooms, ...existingRooms]));

  const filteredDevices = devices.filter((d) => {
    const matchesRoom = selectedRoom === 'all' || d.room.toLowerCase() === selectedRoom.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesSearch;
  });

  const toggleDevicePower = (dev: SmartDevice) => {
    const newState = !dev.state;
    if (newState) {
      playCommandSuccess();
    } else {
      playChirp(900);
    }
    onUpdateDevice({ 
      ...dev, 
      state: newState,
      lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleStartScan = () => {
    playChirp(1300);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      playCommandSuccess();
      const randomIp = `192.168.1.${Math.floor(20 + Math.random() * 80)}`;
      setNewDeviceName('Akıllı WiFi RGB Lamba');
      setNewDeviceType('light');
      setNewDeviceRoom('Salon');
      setNewDeviceIp(randomIp);
    }, 1200);
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const resolvedRoom = (customRoomInput.trim() || newDeviceRoom || 'Salon').trim();

    const newDev: SmartDevice = {
      id: `dev_${Date.now()}`,
      name: newDeviceName.trim(),
      room: resolvedRoom,
      type: newDeviceType,
      state: true,
      value: newDeviceType === 'thermostat' ? 22 : newDeviceType === 'light' ? 80 : 50,
      unit: newDeviceType === 'thermostat' ? '°C' : '%',
      details: newDeviceIp ? `IP: ${newDeviceIp} (Yerel Ağ)` : 'WiFi / Zigbee Hub Bağlantısı',
      lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      ipAddress: newDeviceIp || `192.168.1.${Math.floor(10 + Math.random() * 90)}`
    };

    onAddDevice(newDev);
    playCommandSuccess();
    setShowAddModal(false);
    setNewDeviceName('');
    setCustomRoomInput('');
    setNewDeviceIp('');
  };

  return (
    <div id="smart-home-view" className="h-full flex flex-col space-y-4 p-4 overflow-y-auto">
      {/* Top Banner: Smart Home Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#06142a]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 gap-4 shadow-[0_0_20px_rgba(0,180,255,0.1)]">
        <div>
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm md:text-base font-bold text-cyan-200 font-['Orbitron'] tracking-wider">
              EV OTOMASYON SİSTEMİ // AKILLI CİHAZ KONTROLÜ
            </h2>
          </div>
          <p className="text-xs text-cyan-400/70 font-sans mt-0.5">
            {devices.length === 0 
              ? 'Şu anda sisteminizde kayıtlı cihaz bulunmuyor. "Cihaz Ekle" butonuna basarak ilk cihazınızı bağlayabilirsiniz.' 
              : `J.A.R.V.I.S. otomasyonu: ${devices.length} aktif cihaz, ${devices.filter(d => d.state).length} açık.`}
          </p>
        </div>

        {/* Action Buttons: Quick Automation & Add Device */}
        <div className="flex flex-wrap items-center gap-2">
          {devices.length > 0 && (
            <>
              <button
                id="btn-scene-all-on"
                onClick={() => {
                  playCommandSuccess();
                  devices.forEach(d => {
                    if (!d.state) onUpdateDevice({ ...d, state: true });
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Tümünü Aç</span>
              </button>

              <button
                id="btn-scene-all-off"
                onClick={() => {
                  playChirp(900);
                  devices.forEach(d => {
                    if (d.state) onUpdateDevice({ ...d, state: false });
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Tümünü Kapat</span>
              </button>
            </>
          )}

          <button
            id="btn-add-device-modal"
            onClick={() => {
              playChirp(1200);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-['Orbitron'] flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>CİHAZ EKLE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Room Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 flex-1">
          <button
            onClick={() => {
              playChirp(1100);
              setSelectedRoom('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedRoom === 'all'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-[#081830] text-slate-400 hover:text-cyan-200 border border-cyan-500/10'
            }`}
          >
            Tüm Odalar ({devices.length})
          </button>

          {existingRooms.map((room) => {
            const active = selectedRoom.toLowerCase() === room.toLowerCase();
            const count = devices.filter((d) => d.room.toLowerCase() === room.toLowerCase()).length;
            return (
              <button
                key={room}
                onClick={() => {
                  playChirp(1100);
                  setSelectedRoom(room);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'bg-[#081830] text-slate-400 hover:text-cyan-200 border border-cyan-500/10'
                }`}
              >
                {room} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cihaz veya oda ara..."
            className="w-full bg-[#040e20] border border-cyan-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Empty State when no devices exist */}
      {devices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#051124]/90 rounded-2xl border-2 border-dashed border-cyan-500/30 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-cyan-200 font-['Orbitron']">
            HENÜZ BAĞLI AKILLI CİHAZ YOK
          </h3>
          <p className="text-xs text-cyan-400/70 max-w-md mt-2 leading-relaxed font-sans">
            Ev sisteminiz sıfırlandı ve tamamen sizin cihazlarınızı eklemeniz için hazırlandı. 
            Evinizdeki akıllı lamba, klima, priz, TV veya kilitleri ekleyerek J.A.R.V.I.S. ile yönetebilirsiniz.
          </p>
          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={() => {
                playChirp(1200);
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-['Orbitron'] flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>İLK CİHAZINI EKLE</span>
            </button>
            <button
              onClick={() => {
                playCommandSuccess();
                // Add common home devices sample on demand if user wants quick start
                const sampleDevices: SmartDevice[] = [
                  { id: `dev_sample_1`, name: 'Salon Tavan Işıkları', room: 'Salon', type: 'light', state: true, value: 85, unit: '%' },
                  { id: `dev_sample_2`, name: 'Klima / Termostat', room: 'Salon', type: 'thermostat', state: true, value: 22, unit: '°C' },
                  { id: `dev_sample_3`, name: 'Ana Kapı Akıllı Kilit', room: 'Giriş / Koridor', type: 'lock', state: true }
                ];
                sampleDevices.forEach(d => onAddDevice(d));
              }}
              className="px-4 py-2.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono cursor-pointer"
            >
              Örnek Cihaz Seti Yükle
            </button>
          </div>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs font-mono space-y-2">
          <p>Arama veya filtre kriterlerine uygun cihaz bulunamadı.</p>
          <button
            onClick={() => {
              setSelectedRoom('all');
              setSearchQuery('');
            }}
            className="text-cyan-400 underline hover:text-cyan-200 cursor-pointer"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        /* Devices Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const isOn = device.state;
            return (
              <div
                key={device.id}
                id={`device-card-${device.id}`}
                className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 ${
                  isOn 
                    ? 'bg-[#071936]/90 border-cyan-400/40 shadow-[0_0_15px_rgba(0,210,255,0.12)]' 
                    : 'bg-[#050f21]/70 border-slate-800 opacity-75'
                }`}
              >
                <div>
                  {/* Device Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg ${
                        isOn ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {device.type === 'light' && <Lightbulb className="w-5 h-5" />}
                        {device.type === 'thermostat' && <Thermometer className="w-5 h-5 text-amber-400" />}
                        {device.type === 'lock' && (isOn ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-rose-400" />)}
                        {device.type === 'audio' && <Music className="w-5 h-5 text-sky-400" />}
                        {device.type === 'tv' && <Tv className="w-5 h-5 text-purple-400" />}
                        {device.type === 'fan' && <Fan className="w-5 h-5 text-cyan-300" />}
                        {device.type === 'power' && <Zap className="w-5 h-5 text-yellow-400" />}
                        {device.type === 'vacuum' && <Cpu className="w-5 h-5 text-teal-300" />}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-cyan-100 font-sans tracking-tight">
                          {device.name}
                        </h3>
                        <div className="text-[10px] text-cyan-400/60 font-mono">
                          {device.room.toUpperCase()} • {device.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Power Toggle & Delete Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => toggleDevicePower(device)}
                        title={isOn ? 'Kapat' : 'Aç'}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          isOn 
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {onDeleteDevice && (
                        <button
                          onClick={() => {
                            playAlert();
                            onDeleteDevice(device.id);
                          }}
                          title="Cihazı Kaldır"
                          className="p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-details & IP */}
                  <div className="flex items-center justify-between text-[10px] text-cyan-400/60 font-mono mt-2.5">
                    <span>{device.details || 'WiFi / Zigbee Bağlantısı'}</span>
                    {device.ipAddress && <span>{device.ipAddress}</span>}
                  </div>
                </div>

                {/* Specific Control Sliders */}
                <div className="mt-4 pt-3 border-t border-cyan-500/20 space-y-2">
                  {/* Light Brightness Slider */}
                  {device.type === 'light' && isOn && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-cyan-300 font-mono">
                        <span>Parlaklık</span>
                        <span className="font-bold">{device.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={device.value || 50}
                        onChange={(e) => {
                          onUpdateDevice({ ...device, value: parseInt(e.target.value) });
                        }}
                        className="w-full accent-cyan-400 h-1.5 bg-cyan-950 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Thermostat Stepper & Slider */}
                  {device.type === 'thermostat' && (
                    <div className="flex items-center justify-between bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center space-x-1.5">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-200 font-mono">Hedef Sıcaklık:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            playChirp(1000);
                            onUpdateDevice({ ...device, value: Math.max(16, (device.value || 22) - 1) });
                          }}
                          className="w-6 h-6 rounded bg-cyan-900/80 hover:bg-cyan-700 text-cyan-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-amber-300 font-['Orbitron']">
                          {device.value}°C
                        </span>
                        <button
                          onClick={() => {
                            playChirp(1200);
                            onUpdateDevice({ ...device, value: Math.min(30, (device.value || 22) + 1) });
                          }}
                          className="w-6 h-6 rounded bg-cyan-900/80 hover:bg-cyan-700 text-cyan-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lock Status indicator */}
                  {device.type === 'lock' && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Kilit Durumu:</span>
                      <span className={isOn ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isOn ? '● KİLİTLİ & GÜVENLİ' : '○ KİLİT AÇIK'}
                      </span>
                    </div>
                  )}

                  {/* Audio Volume Slider */}
                  {device.type === 'audio' && isOn && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-cyan-300 font-mono">
                        <span>Ses Seviyesi</span>
                        <span className="font-bold">{device.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={device.value || 40}
                        onChange={(e) => {
                          onUpdateDevice({ ...device, value: parseInt(e.target.value) });
                        }}
                        className="w-full accent-cyan-400 h-1.5 bg-cyan-950 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Power Gauge */}
                  {device.type === 'power' && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Priz Durumu:</span>
                      <span className={isOn ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {isOn ? '● AKIM AKTİF (220V)' : '○ KAPALI'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Smart Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071732] border border-cyan-400/50 rounded-xl p-6 shadow-[0_0_30px_rgba(0,210,255,0.25)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-['Orbitron'] text-sm font-bold text-cyan-200">
                  GERÇEK AKILLI CİHAZ EKLE
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WiFi/LAN Auto Discovery Simulation */}
            <div className="my-4 p-3 bg-cyan-950/40 rounded-lg border border-cyan-500/20 text-center">
              <p className="text-xs text-cyan-300/80 mb-2 font-mono">
                Yerel WiFi / Matter / Zigbee ağındaki yeni cihazları tara:
              </p>
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isScanning}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-mono flex items-center justify-center space-x-2 mx-auto cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-cyan-300' : ''}`} />
                <span>{isScanning ? 'Cihazlar Aranıyor...' : 'Ağı Otomatik Tara'}</span>
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-cyan-300 font-mono mb-1">Cihaz Adı:</label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="örn: Philips Hue Salon Lambası, Daikin Klima..."
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan-300 font-mono mb-1">Oda / Bölüm:</label>
                  <select
                    value={newDeviceRoom}
                    onChange={(e) => setNewDeviceRoom(e.target.value)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  >
                    {allRoomsList.map((rm) => (
                      <option key={rm} value={rm}>{rm}</option>
                    ))}
                    <option value="custom">+ Yeni Oda Adı Gir...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyan-300 font-mono mb-1">Cihaz Türü:</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  >
                    <option value="light">Aydınlatma / Ampul</option>
                    <option value="thermostat">Klima / Termostat</option>
                    <option value="lock">Akıllı Kapı / Kilit</option>
                    <option value="power">Akıllı Priz / Güç</option>
                    <option value="audio">Hoparlör / Ses</option>
                    <option value="tv">Akıllı TV / Ekran</option>
                    <option value="fan">Vantilatör / Havalandırma</option>
                    <option value="vacuum">Robot Süpürge</option>
                  </select>
                </div>
              </div>

              {newDeviceRoom === 'custom' && (
                <div>
                  <label className="block text-cyan-300 font-mono mb-1">Özel Oda Adı:</label>
                  <input
                    type="text"
                    required
                    value={customRoomInput}
                    onChange={(e) => setCustomRoomInput(e.target.value)}
                    placeholder="örn: Balkon, Garaj, Kütüphane..."
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-cyan-300 font-mono mb-1">IP Adresi / Port (İsteğe Bağlı):</label>
                <input
                  type="text"
                  value={newDeviceIp}
                  onChange={(e) => setNewDeviceIp(e.target.value)}
                  placeholder="örn: 192.168.1.105"
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-['Orbitron'] cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Cihazı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
