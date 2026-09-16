import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Info, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Filter, 
  Sparkles, 
  Compass, 
  Navigation, 
  ShieldAlert, 
  Building2, 
  Ship, 
  CloudRain, 
  Zap, 
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { 
  RegionalNewsItem, 
  UserLocationDetails, 
  TimeHorizon, 
  NewsCategory, 
  NewsSeverity 
} from '../types';
import { playChirp, playCommandSuccess, playAlert } from '../utils/soundEffects';
import { speakText, stopSpeaking } from '../utils/speech';

interface RegionalRadarViewProps {
  location: UserLocationDetails;
  onUpdateLocation: (newLocation: Partial<UserLocationDetails>) => void;
  onRefreshLocationGPS: () => void;
  newsList: RegionalNewsItem[];
  onRefreshNewsAI: () => void;
  isLoadingNews: boolean;
  isSpeaking: boolean;
  briefingText: string;
}

const PRESET_LOCATIONS = [
  {
    label: 'Yalova / Altınova (Önerilen)',
    city: 'Yalova',
    district: 'Altınova',
    province: 'Yalova',
    country: 'Türkiye',
    nearbyCities: ['Kocaeli', 'Bursa', 'İstanbul'],
    lat: 40.697,
    lon: 29.508
  },
  {
    label: 'Kocaeli / İzmit',
    city: 'Kocaeli',
    district: 'İzmit',
    province: 'Kocaeli',
    country: 'Türkiye',
    nearbyCities: ['Yalova', 'İstanbul', 'Sakarya', 'Bursa'],
    lat: 40.765,
    lon: 29.940
  },
  {
    label: 'Bursa / Osmangazi',
    city: 'Bursa',
    district: 'Osmangazi',
    province: 'Bursa',
    country: 'Türkiye',
    nearbyCities: ['Yalova', 'Kocaeli', 'Balıkesir', 'İstanbul'],
    lat: 40.188,
    lon: 29.061
  },
  {
    label: 'İstanbul / Kadıköy',
    city: 'İstanbul',
    district: 'Kadıköy',
    province: 'İstanbul',
    country: 'Türkiye',
    nearbyCities: ['Kocaeli', 'Yalova', 'Bursa', 'Tekirdağ'],
    lat: 40.990,
    lon: 29.025
  },
  {
    label: 'Ankara / Çankaya',
    city: 'Ankara',
    district: 'Çankaya',
    province: 'Ankara',
    country: 'Türkiye',
    nearbyCities: ['Eskişehir', 'Konya', 'Kırıkkale', 'Bolu'],
    lat: 39.920,
    lon: 32.854
  },
  {
    label: 'İzmir / Konak',
    city: 'İzmir',
    district: 'Konak',
    province: 'İzmir',
    country: 'Türkiye',
    nearbyCities: ['Manisa', 'Aydın', 'Balıkesir'],
    lat: 38.419,
    lon: 27.128
  }
];

export const RegionalRadarView: React.FC<RegionalRadarViewProps> = ({
  location,
  onUpdateLocation,
  onRefreshLocationGPS,
  newsList,
  onRefreshNewsAI,
  isLoadingNews,
  isSpeaking,
  briefingText
}) => {
  const [activeHorizon, setActiveHorizon] = useState<TimeHorizon | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [customDistrictInput, setCustomDistrictInput] = useState('');
  const [newNeighborInput, setNewNeighborInput] = useState('');

  // Voice readout state for single items
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);

  // Available cities in the filter
  const cityFilterOptions = useMemo(() => {
    const list = [location.city, ...location.nearbyCities];
    return Array.from(new Set(list));
  }, [location]);

  // Filter news items
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      // Horizon filter
      if (activeHorizon !== 'all' && item.timeHorizon !== activeHorizon) {
        return false;
      }
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // City filter
      if (selectedCityFilter !== 'all') {
        const itemCity = item.city.toLowerCase();
        const targetCity = selectedCityFilter.toLowerCase();
        if (!itemCity.includes(targetCity) && !targetCity.includes(itemCity)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSum = item.summary.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        const matchDist = item.district?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchSum && !matchCity && !matchDist) {
          return false;
        }
      }
      return true;
    });
  }, [newsList, activeHorizon, activeCategory, selectedCityFilter, searchQuery]);

  // Counts by time horizon
  const counts = useMemo(() => {
    return {
      all: newsList.length,
      today: newsList.filter((n) => n.timeHorizon === 'today').length,
      oneToThree: newsList.filter((n) => n.timeHorizon === '1-3-days').length,
      sevenToEight: newsList.filter((n) => n.timeHorizon === '7-8-days').length
    };
  }, [newsList]);

  // Play full executive briefing
  const handlePlayBriefing = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      playCommandSuccess();
      speakText(briefingText, 'tr-TR', () => {
        setPlayingItemId(null);
      });
    }
  };

  // Play single news item
  const handlePlaySingleItem = (item: RegionalNewsItem) => {
    if (playingItemId === item.id) {
      stopSpeaking();
      setPlayingItemId(null);
    } else {
      playChirp(1200);
      setPlayingItemId(item.id);
      const textToSpeak = `${item.city} ${item.district || ''} bölgesinden haber: ${item.title}. ${item.summary} ${item.actionRecommendation ? `Asistan tavsiyesi: ${item.actionRecommendation}` : ''}`;
      speakText(textToSpeak, 'tr-TR', () => {
        setPlayingItemId(null);
      });
    }
  };

  // Apply preset location
  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    playCommandSuccess();
    onUpdateLocation({
      city: preset.city,
      district: preset.district,
      province: preset.province,
      country: preset.country,
      nearbyCities: preset.nearbyCities,
      latitude: preset.lat,
      longitude: preset.lon,
      formattedLocation: `${preset.province} / ${preset.district}`
    });
    setShowLocationSettings(false);
  };

  // Apply custom location
  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    playCommandSuccess();
    onUpdateLocation({
      city: customCityInput.trim(),
      district: customDistrictInput.trim() || 'Merkez',
      province: customCityInput.trim(),
      formattedLocation: `${customCityInput.trim()} / ${customDistrictInput.trim() || 'Merkez'}`
    });
    setCustomCityInput('');
    setCustomDistrictInput('');
    setShowLocationSettings(false);
  };

  // Add custom neighbor city
  const handleAddNeighbor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighborInput.trim()) return;
    const clean = newNeighborInput.trim();
    if (!location.nearbyCities.includes(clean)) {
      playChirp(1300);
      onUpdateLocation({
        nearbyCities: [...location.nearbyCities, clean]
      });
    }
    setNewNeighborInput('');
  };

  // Remove neighbor city
  const handleRemoveNeighbor = (cityName: string) => {
    playChirp(900);
    onUpdateLocation({
      nearbyCities: location.nearbyCities.filter((c) => c !== cityName)
    });
  };

  const getCategoryIcon = (category: NewsCategory) => {
    switch (category) {
      case 'transport':
        return <Ship className="w-4 h-4 text-sky-400" />;
      case 'weather_alert':
        return <CloudRain className="w-4 h-4 text-amber-400" />;
      case 'infrastructure':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'economy_events':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div 
      id="regional-radar-view" 
      className="h-full flex flex-col overflow-y-auto p-3 sm:p-5 space-y-4 bg-gradient-to-b from-[#040d1e] via-[#051124] to-[#040a16] text-cyan-100 font-mono select-none custom-scrollbar"
    >
      {/* Top Banner: Regional Intelligence Header */}
      <div className="bg-[#071732]/95 border border-cyan-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(0,210,255,0.12)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Active Location Info */}
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
              <Compass className="w-6 h-6 text-cyan-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-cyan-100 font-sans tracking-wide">
                  {location.city} {location.district ? `/ ${location.district}` : ''}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  TAM KONUM AKTİF
                </span>
                <span className="text-[10px] text-cyan-400/70">
                  {location.latitude && location.longitude 
                    ? `[${location.latitude.toFixed(3)}°K, ${location.longitude.toFixed(3)}°D]`
                    : '[GPS Koordinatı Aktif]'}
                </span>
              </div>

              {/* Neighboring Cities Radar Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-cyan-400/70 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Çevre İller Radarı:
                </span>
                {location.nearbyCities.map((nc) => (
                  <span
                    key={nc}
                    className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono flex items-center gap-1 hover:border-cyan-400 transition-colors"
                  >
                    <span>{nc}</span>
                    <button
                      onClick={() => handleRemoveNeighbor(nc)}
                      className="text-cyan-500/60 hover:text-rose-400 ml-1 cursor-pointer"
                      title={`${nc} ilini filtreden kaldır`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setShowLocationSettings(!showLocationSettings)}
                  className="px-2 py-0.5 rounded bg-cyan-900/50 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-300 text-[10px] cursor-pointer transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Konum / Çevre İl Yönetimi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions: Voice Briefing & Refresh AI */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* J.A.R.V.I.S. Audio Briefing Button */}
            <button
              id="jarvis-briefing-btn"
              onClick={handlePlayBriefing}
              className={`px-3.5 py-2 rounded-lg border text-xs font-sans font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                isSpeaking
                  ? 'bg-rose-950/90 border-rose-400 text-rose-200 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-cyan-950/90 hover:bg-cyan-900/90 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-300" />
              )}
              <span>{isSpeaking ? 'Brifingi Durdur' : 'Sesli Gündem Brifingi'}</span>
            </button>

            {/* AI Live Radar Refresh */}
            <button
              id="ai-refresh-radar-btn"
              onClick={() => {
                playChirp(1400);
                onRefreshNewsAI();
              }}
              disabled={isLoadingNews}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-400/60 text-cyan-100 text-xs font-sans font-medium flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNews ? 'animate-spin text-cyan-300' : ''}`} />
              <span>{isLoadingNews ? 'Radarlar Taranıyor...' : 'Yapay Zeka ile Güncelle'}</span>
            </button>

            {/* GPS Find Button */}
            <button
              onClick={() => {
                playChirp(1100);
                onRefreshLocationGPS();
              }}
              title="Gerçek Cihaz Konumunu Yeniden Tara (GPS)"
              className="p-2 rounded-lg bg-[#091e3e] hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-cyan-300" />
            </button>
          </div>
        </div>

        {/* J.A.R.V.I.S. Audio Briefing Subtitle Text */}
        <div className="mt-3.5 pt-3 border-t border-cyan-500/20 flex items-start space-x-2.5 text-xs text-cyan-200/90 bg-[#061226]/80 p-2.5 rounded-lg font-sans">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-cyan-300 font-mono mr-1">J.A.R.V.I.S. Özeti:</span>
            {briefingText}
          </div>
        </div>

        {/* Expandable Location & Neighbor Manager Drawer */}
        {showLocationSettings && (
          <div className="mt-3 pt-3 border-t border-cyan-500/30 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#051124] p-3 rounded-lg">
            {/* Presets */}
            <div>
              <span className="text-[11px] font-bold text-cyan-300 block mb-1.5">
                Hızlı Konum Değiştir (Test / Şehir Seçimi):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-1.5 rounded border text-[11px] font-mono transition-all cursor-pointer ${
                      location.city === preset.city
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 font-bold'
                        : 'bg-[#081a38] border-cyan-500/20 text-slate-300 hover:text-cyan-200 hover:border-cyan-500/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-cyan-300 block">
                Özel Konum veya Çevre İl Ekle:
              </span>
              <form onSubmit={handleSaveCustomLocation} className="flex gap-2">
                <input
                  type="text"
                  placeholder="İl (Örn: Yalova)"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="w-1/2 bg-[#091d3d] border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="İlçe (Örn: Altınova)"
                  value={customDistrictInput}
                  onChange={(e) => setCustomDistrictInput(e.target.value)}
                  className="w-1/2 bg-[#091d3d] border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs cursor-pointer"
                >
                  Uygula
                </button>
              </form>

              <form onSubmit={handleAddNeighbor} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Çevre İl Ekle (Örn: Sakarya, Bilecik)"
                  value={newNeighborInput}
                  onChange={(e) => setNewNeighborInput(e.target.value)}
                  className="flex-1 bg-[#091d3d] border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 rounded text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ekle
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar: Time Horizons & Categories */}
      <div className="flex flex-col gap-3 bg-[#06142a]/90 p-3 rounded-xl border border-cyan-500/30">
        {/* Time Horizon Pills (Canlı / 1-3 Gün / 7-8 Gün) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-cyan-400/80 mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Zaman Ufku:
            </span>

            {/* All */}
            <button
              onClick={() => {
                playChirp(1000);
                setActiveHorizon('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHorizon === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'bg-[#091e3e] text-cyan-300 hover:bg-[#0c264f] border border-cyan-500/20'
              }`}
            >
              <span>Tümü</span>
              <span className="text-[10px] px-1 rounded bg-black/20">{counts.all}</span>
            </button>

            {/* Today */}
            <button
              onClick={() => {
                playChirp(1050);
                setActiveHorizon('today');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHorizon === 'today'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-[#091e3e] text-emerald-300 hover:bg-[#0c264f] border border-emerald-500/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Bugün (Canlı Gündem)</span>
              <span className="text-[10px] px-1 rounded bg-black/20">{counts.today}</span>
            </button>

            {/* 1-3 Days */}
            <button
              onClick={() => {
                playChirp(1100);
                setActiveHorizon('1-3-days');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHorizon === '1-3-days'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-[#091e3e] text-amber-300 hover:bg-[#0c264f] border border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>1-3 Gün İçi (Yakın Gelecek)</span>
              <span className="text-[10px] px-1 rounded bg-black/20">{counts.oneToThree}</span>
            </button>

            {/* 7-8 Days */}
            <button
              onClick={() => {
                playChirp(1150);
                setActiveHorizon('7-8-days');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHorizon === '7-8-days'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-[#091e3e] text-purple-300 hover:bg-[#0c264f] border border-purple-500/30'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>7-8 Gün İçi (Haftalık Projeksiyon)</span>
              <span className="text-[10px] px-1 rounded bg-black/20">{counts.sevenToEight}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Gündemde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#081834] border border-cyan-500/30 rounded-lg pl-8 pr-2 py-1 text-xs text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Secondary Filter: City and Categories */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/20 text-xs">
          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-cyan-400/70 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Şehir:
            </span>
            <button
              onClick={() => setSelectedCityFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                selectedCityFilter === 'all'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-[#091e3e] text-cyan-300 border border-cyan-500/20'
              }`}
            >
              Tüm Bölge
            </button>
            {cityFilterOptions.map((cityName) => (
              <button
                key={cityName}
                onClick={() => setSelectedCityFilter(cityName)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  selectedCityFilter === cityName
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'bg-[#091e3e] text-cyan-300 border border-cyan-500/20'
                }`}
              >
                {cityName}
                {cityName === location.city && ' (Merkez)'}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {(['all', 'transport', 'weather_alert', 'infrastructure', 'economy_events'] as const).map((cat) => {
              const labels: Record<string, string> = {
                all: 'Tüm Konular',
                transport: 'Ulaşım & Feribot',
                weather_alert: 'Hava & Güvenlik',
                infrastructure: 'Altyapı / Kesinti',
                economy_events: 'Sanayi & Ekonomi'
              };
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-cyan-200'
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content: News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredNews.length === 0 ? (
          <div className="col-span-full bg-[#06142a]/60 border border-cyan-500/20 rounded-xl p-8 text-center text-cyan-400/60">
            <Radio className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
            <p className="font-sans text-sm">Seçili filtre ve zaman ufkuna uygun haber kaydı bulunamadı.</p>
            <p className="text-xs text-cyan-500/60 mt-1">Filtreleri sıfırlayabilir veya "Yapay Zeka ile Güncelle" butonuna basabilirsiniz.</p>
          </div>
        ) : (
          filteredNews.map((item) => {
            const isPlaying = playingItemId === item.id;
            const isCritical = item.severity === 'critical';
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 flex flex-col justify-between p-4 relative bg-[#071732]/90 hover:bg-[#091e3e] shadow-md ${
                  isCritical 
                    ? 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                    : isWarning
                    ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'border-cyan-500/30'
                }`}
              >
                <div>
                  {/* Card Header: Location badge & Time Horizon badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Location Badge */}
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-200">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.city}</span>
                      {item.district && (
                        <span className="text-cyan-400/70 font-normal">({item.district})</span>
                      )}
                      {item.isNeighboringCity && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          ÇEVRE İL
                        </span>
                      )}
                    </div>

                    {/* Time Horizon Badge */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                          item.timeHorizon === 'today'
                            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                            : item.timeHorizon === '1-3-days'
                            ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                            : 'bg-purple-950/80 border border-purple-500/50 text-purple-300'
                        }`}
                      >
                        {item.timeHorizon === 'today' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                        {item.timeHorizonLabel}
                      </span>
                    </div>
                  </div>

                  {/* Category & Forecast Date banner */}
                  <div className="flex items-center space-x-2 text-[11px] text-cyan-400/80 font-mono mb-2">
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      <span>{item.categoryLabel}</span>
                    </span>
                    <span>•</span>
                    <span className="text-amber-300/90">{item.forecastDate}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-cyan-100 font-sans leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  {/* Impact Box */}
                  {item.impact && (
                    <div className="text-[11px] font-sans bg-[#050f21] border-l-2 border-cyan-400 p-2 rounded-r mb-2.5 text-cyan-200/90">
                      <span className="font-bold text-cyan-300 font-mono">Bölgesel Etki:</span> {item.impact}
                    </div>
                  )}

                  {/* Action Recommendation Box */}
                  {item.actionRecommendation && (
                    <div className="text-[11px] font-sans bg-amber-950/30 border border-amber-500/30 p-2 rounded mb-2.5 text-amber-200">
                      <span className="font-bold font-mono text-amber-300">J.A.R.V.I.S. Önerisi:</span> {item.actionRecommendation}
                    </div>
                  )}
                </div>

                {/* Card Footer: Source & Speak Button */}
                <div className="pt-2.5 mt-1 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-cyan-400/60 font-mono">
                  <span className="truncate max-w-[200px]" title={item.source}>
                    Kaynak: {item.source}
                  </span>

                  <button
                    onClick={() => handlePlaySingleItem(item)}
                    className={`px-2.5 py-1 rounded border text-[11px] font-sans font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-rose-950 border-rose-400 text-rose-200'
                        : 'bg-[#091e3e] hover:bg-cyan-900/60 border-cyan-500/30 text-cyan-300'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-3 h-3 text-rose-400 animate-bounce" />
                        <span>Durdur</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        <span>Sesli Dinle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
