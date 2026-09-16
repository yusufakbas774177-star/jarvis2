import React, { useState } from 'react';
import { 
  Home, 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Unlock, 
  Music, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Power, 
  Sliders, 
  Check, 
  X, 
  Radio, 
  Sparkles,
  Wind
} from 'lucide-react';
import { SmartDevice } from '../types';
import { playChirp, playCommandSuccess, playAlert } from '../utils/soundEffects';

interface SmartHomeViewProps {
  devices: SmartDevice[];
  onUpdateDevice: (updated: SmartDevice) => void;
  onAddDevice: (newDevice: SmartDevice) => void;
  onApplyScene: (sceneName: string) => void;
}

export const SmartHomeView: React.FC<SmartHomeViewProps> = ({
  devices,
  onUpdateDevice,
  onAddDevice,
  onApplyScene
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // New device form state
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState<SmartDevice['room']>('living_room');
  const [newDeviceType, setNewDeviceType] = useState<SmartDevice['type']>('light');

  const rooms = [
    { id: 'all', label: 'Tüm Odalar' },
    { id: 'living_room', label: 'Salon & Yaşam' },
    { id: 'lab', label: 'Stark Atölyesi' },
    { id: 'bedroom', label: 'Yatak Odası' },
    { id: 'garage', label: 'Garaj & Savunma' },
    { id: 'power_grid', label: 'Ark Güç Şebekesi' }
  ];

  const filteredDevices = devices.filter((d) => 
    selectedRoom === 'all' ? true : d.room === selectedRoom
  );

  const toggleDevicePower = (dev: SmartDevice) => {
    const newState = !dev.state;
    if (newState) {
      playCommandSuccess();
    } else {
      playChirp(900);
    }
    onUpdateDevice({ ...dev, state: newState });
  };

  const handleStartScan = () => {
    playChirp(1300);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      playCommandSuccess();
      setNewDeviceName('Stark IoT Sensör Hub v2');
    }, 1800);
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    const newDev: SmartDevice = {
      id: `dev_${Date.now()}`,
      name: newDeviceName,
      room: newDeviceRoom,
      type: newDeviceType,
      state: true,
      value: newDeviceType === 'thermostat' ? 22 : newDeviceType === 'light' ? 80 : 50,
      unit: newDeviceType === 'thermostat' ? '°C' : '%',
      details: 'Matter 2.0 / Zigbee StarkLink üzerinden bağlandı.'
    };
    onAddDevice(newDev);
    playCommandSuccess();
    setShowAddModal(false);
    setNewDeviceName('');
  };

  return (
    <div id="smart-home-view" className="h-full flex flex-col space-y-4 p-4 overflow-y-auto">
      {/* Top Banner: Smart Home Status & Quick Scenes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#06142a]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm md:text-base font-bold text-cyan-200 font-['Orbitron'] tracking-wider">
              MALIBU MALİKANESİ // AKILLI SİSTEMLER
            </h2>
          </div>
          <p className="text-xs text-cyan-400/70 font-sans mt-0.5">
            J.A.R.V.I.S. entegreli otomasyon matrisi: 12 aktif düğüm, sıfır gecikmeli protokol.
          </p>
        </div>

        {/* Quick Stark Scene Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-scene-lab"
            onClick={() => {
              playCommandSuccess();
              onApplyScene('lab_focus');
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Atölye Modu</span>
          </button>

          <button
            id="btn-scene-night"
            onClick={() => {
              playAlert();
              onApplyScene('night_stealth');
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>Gece Koruması</span>
          </button>

          <button
            id="btn-add-device-modal"
            onClick={() => {
              playChirp(1200);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-['Orbitron'] flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Cihaz Ekle</span>
          </button>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {rooms.map((room) => {
          const active = selectedRoom === room.id;
          return (
            <button
              key={room.id}
              onClick={() => {
                playChirp(1100);
                setSelectedRoom(room.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#081830] text-slate-400 hover:text-cyan-200 border border-cyan-500/10'
              }`}
            >
              {room.label}
            </button>
          );
        })}
      </div>

      {/* Devices Grid */}
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
                      {device.type === 'power' && <Zap className="w-5 h-5 text-yellow-400" />}
                      {device.type === 'defense' && <ShieldCheck className="w-5 h-5 text-purple-400" />}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-cyan-100 font-sans tracking-tight">
                        {device.name}
                      </h3>
                      <div className="text-[10px] text-cyan-400/60 font-mono">
                        {device.room.toUpperCase().replace('_', ' ')} // {device.type.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Power Button */}
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
                </div>

                {/* Sub-details & Description */}
                {device.details && (
                  <p className="text-[11px] text-cyan-300/70 font-mono mt-2.5">
                    {device.details}
                  </p>
                )}
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
                      <span className="text-xs text-cyan-200 font-mono">Hedef:</span>
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
                    <span className="text-slate-400">Kapasite / Yük:</span>
                    <span className="text-yellow-400 font-bold font-['Orbitron']">
                      {device.value} {device.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Smart Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071732] border border-cyan-400/50 rounded-xl p-6 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-['Orbitron'] text-sm font-bold text-cyan-200">
                  YENİ AKILLI CİHAZ EŞLEŞTİR
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matter/Zigbee Auto Scan Section */}
            <div className="my-4 p-3 bg-cyan-950/40 rounded-lg border border-cyan-500/20 text-center">
              <p className="text-xs text-cyan-300/80 mb-2">
                Ev içi kablosuz Matter / Zigbee / StarkLink sinyallerini tara:
              </p>
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isScanning}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-mono flex items-center justify-center space-x-2 mx-auto cursor-pointer"
              >
                <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin text-cyan-300' : ''}`} />
                <span>{isScanning ? 'Cihazlar Aranıyor...' : 'Ağdaki Cihazları Tara'}</span>
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
                  placeholder="örn: Çalışma Masası Lambası"
                  className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan-300 font-mono mb-1">Oda:</label>
                  <select
                    value={newDeviceRoom}
                    onChange={(e) => setNewDeviceRoom(e.target.value as any)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  >
                    <option value="living_room">Salon & Yaşam</option>
                    <option value="lab">Stark Atölyesi</option>
                    <option value="bedroom">Yatak Odası</option>
                    <option value="garage">Garaj & Savunma</option>
                    <option value="power_grid">Güç Şebekesi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyan-300 font-mono mb-1">Cihaz Türü:</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full bg-[#040e20] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none"
                  >
                    <option value="light">Aydınlatma</option>
                    <option value="thermostat">Termostat & Klima</option>
                    <option value="lock">Akıllı Kilit / Kapı</option>
                    <option value="audio">Ses & Medya</option>
                    <option value="power">Güç / Batarya</option>
                    <option value="defense">Savunma / Sensör</option>
                  </select>
                </div>
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
                  Sisteme Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
