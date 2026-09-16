import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SystemView, 
  SmartDevice, 
  FileItem, 
  TransferJob, 
  ChatMessage, 
  JarvisAction,
  DeviceInfo,
  DeviceMode,
  AssistantTask,
  AssistantNote,
  RegionalNewsItem,
  UserLocationDetails
} from './types';
import { 
  INITIAL_SMART_DEVICES, 
  INITIAL_FILES, 
  INITIAL_TRANSFERS 
} from './data/mockSystem';
import { 
  INITIAL_REGIONAL_NEWS, 
  getNearbyProvinces, 
  normalizeCityName, 
  generateVoiceBriefing 
} from './utils/regionalRadar';
import { getDeviceInfo, requestBatteryStatus } from './utils/deviceDetector';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { MobileHeaderBar } from './components/MobileHeaderBar';
import { MobileNavigationDock } from './components/MobileNavigationDock';
import { NeuralCoreHUD, LocationWeatherState } from './components/NeuralCoreHUD';
import { JarvisConsole } from './components/JarvisConsole';
import { SmartHomeView } from './components/SmartHomeView';
import { FileExplorerView } from './components/FileExplorerView';
import { DataTransferView } from './components/DataTransferView';
import { PlannerView } from './components/PlannerView';
import { NotesView } from './components/NotesView';
import { AiToolsView } from './components/AiToolsView';
import { RegionalRadarView } from './components/RegionalRadarView';
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
  Maximize, 
  Sparkles,
  Bot,
  Home,
  FolderKanban,
  Radio,
  MapPin,
  Calendar,
  FileText,
  Cpu,
  Smartphone,
  Monitor
} from 'lucide-react';

const INITIAL_TASKS: AssistantTask[] = [
  {
    id: 'task_1',
    title: 'Sabah Sistem ve Güvenlik Teşhisi',
    description: 'Tüm ağ bağlantıları, yedekleme diskleri ve ev güvenlik kilitlerini denetle.',
    completed: true,
    priority: 'medium',
    category: 'work',
    dueDate: 'Bugün',
    dueTime: '09:00',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'task_2',
    title: 'J.A.R.V.I.S. Akıllı Ev Senkronizasyonu',
    description: 'Yeni eklenen oda ışıklandırmaları ve termostat sınırlarını test et.',
    completed: false,
    priority: 'high',
    category: 'home',
    dueDate: 'Bugün',
    dueTime: '14:30',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'task_3',
    title: 'Önemli Belgeleri Şifreli Buluta Aktar',
    description: 'AES-256 şifreli veri aktarım kanalı ile yedekleme yap.',
    completed: false,
    priority: 'medium',
    category: 'work',
    dueDate: 'Bugün',
    dueTime: '17:00',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'task_4',
    title: 'Günlük 2 Litre Su ve Mola Hatırlatması',
    description: 'Yoğun çalışma sırasında saat başı kısa mola ve hidrasyon.',
    completed: false,
    priority: 'low',
    category: 'health',
    dueDate: 'Her Gün',
    dueTime: 'Gün Boyu',
    createdAt: new Date().toLocaleDateString('tr-TR')
  }
];

const INITIAL_NOTES: AssistantNote[] = [
  {
    id: 'note_1',
    title: 'J.A.R.V.I.S. Akıllı Asistan Kullanım Notları',
    content: '1. "Salon ışığını aç" veya "Sıcaklığı 24 derece yap" diyerek evinizi yönetebilirsiniz.\n2. "Şu konuyu araştır" veya "İngilizceye çevir" diyerek yapay zeka araçlarını çağırabilirsiniz.\n3. Dosya gezgininden dosyalarınızı analiz ettirebilir ve şifreli aktarabilirsiniz.',
    category: 'quick',
    tags: ['Rehber', 'Sistem', 'Komutlar'],
    pinned: true,
    updatedAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'note_2',
    title: 'Haftalık Proje Hedefleri',
    content: 'İş istasyonu performans testleri tamamlanacak. Veri aktarım hızları kontrol edilecek. Akıllı priz ve aydınlatma rutinleri test edilecek.',
    category: 'project',
    tags: ['Proje', 'İş'],
    pinned: false,
    updatedAt: new Date().toLocaleDateString('tr-TR')
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<SystemView>('hud');
  const [smartDevices, setSmartDevices] = useState<SmartDevice[]>(INITIAL_SMART_DEVICES);
  const [filesList, setFilesList] = useState<FileItem[]>(INITIAL_FILES);
  const [transfers, setTransfers] = useState<TransferJob[]>(INITIAL_TRANSFERS);
  const [tasks, setTasks] = useState<AssistantTask[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<AssistantNote[]>(INITIAL_NOTES);

  // Device Info & Layout Mode (auto / mobile / desktop)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo());
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');

  // Audio and Speech State
  const [soundEnabledState, setSoundEnabledState] = useState(true);
  const [voiceEnabledState, setVoiceEnabledState] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Speech Recognition Ref for Mobile Push-to-Talk Dock
  const speechRecognitionRef = useRef<any>(null);

  // Determine effective mobile view
  const effectiveIsMobile = deviceMode === 'auto' ? deviceInfo.isMobile : deviceMode === 'mobile';

  // Responsive device detector listener & Battery Status
  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };
    window.addEventListener('resize', handleResize);

    // Battery status query
    requestBatteryStatus().then((bat) => {
      if (bat.level !== null) {
        setDeviceInfo((prev) => ({
          ...prev,
          batteryLevel: bat.level,
          isCharging: bat.charging
        }));
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Active Location & Weather State (Defaulting to user's requested location: Yalova / Altınova)
  const [locationWeather, setLocationWeather] = useState<LocationWeatherState>({
    city: 'Yalova',
    country: 'Türkiye',
    latitude: 40.697,
    longitude: 29.508,
    tempC: 21,
    condition: 'Açık & Güneşli',
    humidity: 58,
    windSpeed: 14,
    loading: false
  });

  // User's Precise Location & Surrounding Provinces State
  const [userLocation, setUserLocation] = useState<UserLocationDetails>({
    city: 'Yalova',
    district: 'Altınova',
    province: 'Yalova',
    country: 'Türkiye',
    latitude: 40.697,
    longitude: 29.508,
    nearbyCities: ['Kocaeli', 'Bursa', 'İstanbul'],
    formattedLocation: 'Yalova / Altınova'
  });

  // Regional News, Traffic, and 1-3 / 7-8 Day Forecasting Dataset
  const [regionalNews, setRegionalNews] = useState<RegionalNewsItem[]>(INITIAL_REGIONAL_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [radarBriefing, setRadarBriefing] = useState<string>(() =>
    generateVoiceBriefing(INITIAL_REGIONAL_NEWS, {
      city: 'Yalova',
      district: 'Altınova',
      province: 'Yalova',
      country: 'Türkiye',
      latitude: 40.697,
      longitude: 29.508,
      nearbyCities: ['Kocaeli', 'Bursa', 'İstanbul'],
      formattedLocation: 'Yalova / Altınova'
    })
  );

  // Fetch AI-powered regional news & forecasts from server
  const fetchRegionalNews = useCallback(async (
    city: string, 
    district: string, 
    nearbyCities: string[]
  ) => {
    setIsLoadingNews(true);
    try {
      const res = await fetch('/api/jarvis/regional-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          district,
          nearbyCities,
          timeHorizon: 'all'
        })
      });
      const data = await res.json();
      if (data.news && Array.isArray(data.news) && data.news.length > 0) {
        setRegionalNews(data.news);
      }
      if (data.speechBriefing) {
        setRadarBriefing(data.speechBriefing);
      } else {
        setRadarBriefing(
          generateVoiceBriefing(data.news && data.news.length > 0 ? data.news : INITIAL_REGIONAL_NEWS, {
            city,
            district,
            province: city,
            country: 'Türkiye',
            latitude: null,
            longitude: null,
            nearbyCities,
            formattedLocation: `${city} / ${district || 'Merkez'}`
          })
        );
      }
    } catch (err) {
      console.warn('Regional news fetch fallback to local intelligence:', err);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Fetch real user location via browser Geolocation & Reverse Geocoding
  const fetchActiveLocationAndWeather = useCallback(() => {
    setLocationWeather((prev) => ({ ...prev, loading: true }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
            );
            const weatherData = await weatherRes.json();
            const currentTemp = Math.round(weatherData.current_weather?.temperature ?? 21);
            const wind = Math.round(weatherData.current_weather?.windspeed ?? 12);
            const code = weatherData.current_weather?.weathercode ?? 0;

            let conditionDesc = 'Açık';
            if (code >= 1 && code <= 3) conditionDesc = 'Parçalı Bulutlu';
            else if (code >= 51 && code <= 67) conditionDesc = 'Yağmurlu';
            else if (code >= 71 && code <= 77) conditionDesc = 'Karlı';
            else if (code >= 95) conditionDesc = 'Fırtınalı';

            let detectedCity = 'Yalova';
            let detectedDistrict = 'Altınova';
            let detectedCountry = 'Türkiye';
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
              );
              const geoData = await geoRes.json();
              const addr = geoData.address || {};
              const rawCity = addr.city || addr.province || addr.state || 'Yalova';
              detectedCity = normalizeCityName(rawCity);
              detectedDistrict = addr.town || addr.district || addr.suburb || addr.county || 'Altınova';
              detectedCountry = addr.country || 'Türkiye';
            } catch {
              // Fallback remains Yalova / Altınova
            }

            const calculatedNeighbors = getNearbyProvinces(detectedCity, detectedDistrict);

            setLocationWeather({
              city: detectedCity,
              country: detectedCountry,
              latitude: lat,
              longitude: lon,
              tempC: currentTemp,
              condition: conditionDesc,
              humidity: 62,
              windSpeed: wind,
              loading: false
            });

            setUserLocation({
              city: detectedCity,
              district: detectedDistrict,
              province: detectedCity,
              country: detectedCountry,
              latitude: lat,
              longitude: lon,
              nearbyCities: calculatedNeighbors,
              formattedLocation: `${detectedCity} / ${detectedDistrict}`
            });

            // Refresh regional news for detected coordinates
            fetchRegionalNews(detectedCity, detectedDistrict, calculatedNeighbors);
          } catch (err) {
            console.warn('Weather API failed, fallback active:', err);
            setLocationWeather((prev) => ({ ...prev, loading: false }));
          }
        },
        (err) => {
          console.warn('Geolocation error or permission denied, using base profile (Yalova/Altınova):', err.message);
          setLocationWeather((prev) => ({
            ...prev,
            loading: false,
            city: 'Yalova',
            country: 'Türkiye'
          }));
        },
        { timeout: 8000 }
      );
    } else {
      setLocationWeather((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchRegionalNews]);

  // Initial welcome message from J.A.R.V.I.S.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetchActiveLocationAndWeather();
  }, [fetchActiveLocationAndWeather]);

  // Greeting on location ready
  useEffect(() => {
    const timeGreeting = new Date().getHours() < 12 ? 'Günaydın' : new Date().getHours() < 18 ? 'İyi günler' : 'İyi akşamlar';
    const deviceTypeLabel = deviceInfo.isMobile ? 'Mobil Cihaz' : deviceInfo.isTablet ? 'Tablet' : 'Windows PC';
    const welcomeText = `${timeGreeting} efendim. J.A.R.V.I.S. ${deviceTypeLabel} ortamınızda tam kapasite devrededir.

Aktif konumunuz ${userLocation.formattedLocation || locationWeather.city} (${locationWeather.tempC}°C, ${locationWeather.condition}). Çevre illerimiz (${userLocation.nearbyCities.join(', ')}) ve bölgesel gündem radarı canlı olarak izlenmektedir. Cihazınız algılandı (${deviceInfo.platformName}, ${deviceInfo.width}x${deviceInfo.height} px) ve arayüz buna göre optimize edildi.

Ev otomasyonu, ajanda & görevler, sesli notlar, şifreli veri aktarımı ve yapay zeka çeviri/yazı araçları emrinizdedir. Size bugün nasıl yardımcı olabilirim?`;

    setMessages([
      {
        id: 'msg_init',
        sender: 'jarvis',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [userLocation.formattedLocation, deviceInfo.isMobile]);

  // Sync speech status with visualizer
  useEffect(() => {
    registerSpeechStatusListener((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Toggle sound effects
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

  const handleToggleDeviceMode = () => {
    setDeviceMode((prev) => {
      if (prev === 'auto') return effectiveIsMobile ? 'desktop' : 'mobile';
      if (prev === 'mobile') return 'desktop';
      return 'auto';
    });
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
            d.type === 'lock' ? { ...d, state: Boolean(action.value) } : d
          )
        );
      }
      playCommandSuccess();
    } else if (action.type === 'DATA_TRANSFER') {
      const newJob: TransferJob = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        filename: String(action.value || 'Guvenli_Veri_Paketi.zip'),
        size: '180.4 MB',
        sizeBytes: 189163520,
        source: 'Yerel Depolama (C:\\)',
        destination: 'Güvenli Bulut Depolama',
        protocol: 'Direct Fiber Link',
        progress: 10,
        speed: '1.20 GB/s',
        status: 'TRANSFERRING',
        cipher: 'AES-256-GCM',
        startedAt: new Date().toLocaleTimeString(),
        eta: '5.4 sn'
      };
      setTransfers((prev) => [newJob, ...prev]);
      playCommandSuccess();
    } else if (action.type === 'FILE_OPERATION') {
      setCurrentView('files');
    } else if (action.type === 'CREATE_TASK') {
      const newTask: AssistantTask = {
        id: `task_${Date.now()}`,
        title: String(action.value || 'Yeni Görev'),
        description: 'J.A.R.V.I.S. tarafından sesli/metin komutuyla oluşturuldu.',
        completed: false,
        priority: 'medium',
        category: 'work',
        dueDate: 'Bugün',
        dueTime: '12:00',
        createdAt: new Date().toLocaleDateString('tr-TR')
      };
      setTasks((prev) => [newTask, ...prev]);
      playCommandSuccess();
    } else if (action.type === 'CREATE_NOTE') {
      const newNote: AssistantNote = {
        id: `note_${Date.now()}`,
        title: 'Hızlı Not',
        content: String(action.value || ''),
        category: 'quick',
        tags: ['Asistan'],
        pinned: false,
        updatedAt: new Date().toLocaleDateString('tr-TR')
      };
      setNotes((prev) => [newNote, ...prev]);
      playCommandSuccess();
    } else if (action.type === 'WEATHER_QUERY') {
      fetchActiveLocationAndWeather();
    } else if (action.type === 'VIEW_REGIONAL_RADAR') {
      setCurrentView('radar');
      playCommandSuccess();
    } else if (action.type === 'READ_NEWS_BRIEFING') {
      setCurrentView('radar');
      playCommandSuccess();
      if (voiceEnabledState) {
        speakText(radarBriefing);
      }
    }
  }, [fetchActiveLocationAndWeather, radarBriefing, voiceEnabledState]);

  // Send message to J.A.R.V.I.S.
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
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
            userLocation: userLocation.formattedLocation || `${locationWeather.city}, ${locationWeather.country}`,
            city: userLocation.city,
            district: userLocation.district,
            nearbyCities: userLocation.nearbyCities.join(', '),
            weather: `${locationWeather.tempC}°C, ${locationWeather.condition}`,
            devicesCount: smartDevices.length,
            devices: smartDevices.map((d) => ({ name: d.name, room: d.room, type: d.type, state: d.state, value: d.value })),
            transfersActive: transfers.filter((t) => t.status === 'TRANSFERRING').length,
            tasksCount: tasks.filter((t) => !t.completed).length,
            device: deviceInfo.platformName
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

      // Speak response aloud if voice enabled
      if (voiceEnabledState) {
        speakText(replySpeech);
      }
    } catch (err: any) {
      console.error('Failed to communicate with J.A.R.V.I.S.:', err);
      const fallbackReply = 'Emredersiniz efendim. İşleminiz işleme alındı.';
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

  // Mobile Push-to-Talk speech recognition
  const handleToggleVoiceMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      playAlert();
      alert('Tarayıcınız Web Speech API mikrofon tanımayı desteklemiyor.');
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSendMessage(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Microphone error:', err);
        setIsListening(false);
      }
    }
  };

  // Smart Home updates
  const handleUpdateSmartDevice = (updated: SmartDevice) => {
    setSmartDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleAddSmartDevice = (newDev: SmartDevice) => {
    setSmartDevices((prev) => [newDev, ...prev]);
    if (voiceEnabledState) {
      speakText(`${newDev.name} başarıyla sisteme bağlandı efendim.`);
    }
  };

  const handleDeleteSmartDevice = (deviceId: string) => {
    setSmartDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  const handleApplyScene = (sceneName: string) => {
    if (sceneName === 'lab_focus') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') return { ...d, state: true, value: 100 };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Çalışma ve odaklanma modu devrede efendim.');
      }
    } else if (sceneName === 'night_stealth') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') return { ...d, state: false };
          if (d.type === 'lock') return { ...d, state: true };
          if (d.type === 'thermostat') return { ...d, value: 20 };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Gece protokolü aktif edildi. Tüm kilitler güvende.');
      }
    } else if (sceneName === 'morning') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') return { ...d, state: true, value: 80 };
          if (d.type === 'thermostat') return { ...d, value: 23 };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Günaydın efendim. Günlük rutininiz başlatıldı.');
      }
    } else if (sceneName === 'cinema') {
      setSmartDevices((prev) =>
        prev.map((d) => {
          if (d.type === 'light') return { ...d, state: true, value: 20 };
          return d;
        })
      );
      if (voiceEnabledState) {
        speakText('Sinema ambiyansı hazırlandı efendim.');
      }
    }
  };

  // Task Handlers
  const handleAddTask = (task: Omit<AssistantTask, 'id' | 'createdAt'>) => {
    const newTask: AssistantTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('tr-TR')
    };
    setTasks((prev) => [newTask, ...prev]);
    if (voiceEnabledState) {
      speakText(`"${task.title}" görevi ajandanıza eklendi efendim.`);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleJarvisBriefing = () => {
    const pending = tasks.filter((t) => !t.completed);
    const briefingText = pending.length > 0
      ? `Efendim, ajandanızda tamamlanmayı bekleyen ${pending.length} adet görev bulunmaktadır. İlk sırada: "${pending[0].title}".`
      : 'Tebrikler efendim, ajandanızda bekleyen hiçbir görev bulunmuyor.';
    if (voiceEnabledState) {
      speakText(briefingText);
    }
  };

  // Note Handlers
  const handleAddNote = (note: Omit<AssistantNote, 'id' | 'updatedAt'>) => {
    const newNote: AssistantNote = {
      ...note,
      id: `note_${Date.now()}`,
      updatedAt: new Date().toLocaleDateString('tr-TR')
    };
    setNotes((prev) => [newNote, ...prev]);
    if (voiceEnabledState) {
      speakText('Notunuz güvenle kaydedildi efendim.');
    }
  };

  const handleUpdateNote = (updated: AssistantNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...updated, updatedAt: new Date().toLocaleDateString('tr-TR') } : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
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
      destination: 'Güvenli Bulut Depolama',
      protocol: 'Direct Fiber Link',
      progress: 0,
      speed: '1.20 GB/s',
      status: 'TRANSFERRING',
      cipher: 'AES-256-GCM',
      startedAt: new Date().toLocaleTimeString(),
      eta: '4.8 sn'
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
    const prompt = `Lütfen şu dosyanın içeriğini ve özetini değerlendir: "${file.name}" (Yol: ${file.path}, Boyut: ${file.size}).\nİçerik özeti:\n${file.content?.slice(0, 300) || 'İkili veri'}`;
    handleSendMessage(prompt);
  };

  // Data Transfer Updates
  const handleStartTransfer = (job: TransferJob) => {
    setTransfers((prev) => [job, ...prev]);
  };

  const handleUpdateTransfer = (updated: TransferJob) => {
    setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleEmergencyDataDump = () => {
    const emergencyJob: TransferJob = {
      id: `TX-BACKUP-${Date.now()}`,
      filename: 'TAM_SISTEM_YEDEKLEME_ARŞİVİ.tar.gz',
      size: '1.45 GB',
      sizeBytes: 1556925644,
      source: 'Yerel Diskler (C: & D:)',
      destination: 'Güvenli Bulut Sunucusu (Şifreli)',
      protocol: 'Encrypted VPN',
      progress: 5,
      speed: '1.40 GB/s',
      status: 'TRANSFERRING',
      cipher: 'AES-256-GCM',
      startedAt: new Date().toLocaleTimeString(),
      eta: '4.2 sn'
    };
    setTransfers((prev) => [emergencyJob, ...prev]);
    setCurrentView('transfer');
    if (voiceEnabledState) {
      speakText('Sistem ve dosya yedekleme işlemi başlatıldı efendim.');
    }
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div 
      id="jarvis-app-root" 
      className="w-screen h-screen flex flex-col bg-[#040914] text-cyan-100 overflow-hidden stark-scanlines stark-grid-bg font-['Rajdhani',sans-serif]"
    >
      {/* 1. Header: Either Mobile Header Bar OR Windows PC Title Bar */}
      {effectiveIsMobile ? (
        <MobileHeaderBar
          deviceInfo={deviceInfo}
          deviceMode={deviceMode}
          onToggleDeviceMode={handleToggleDeviceMode}
          soundEnabled={soundEnabledState}
          onToggleSound={handleToggleSound}
          voiceEnabled={voiceEnabledState}
          onToggleVoice={handleToggleVoice}
          locationCity={locationWeather.city}
          tempC={locationWeather.tempC}
        />
      ) : (
        <WindowsTitleBar
          currentView={currentView}
          onViewChange={(v) => setCurrentView(v)}
          soundEnabled={soundEnabledState}
          onToggleSound={handleToggleSound}
          voiceEnabled={voiceEnabledState}
          onToggleVoice={handleToggleVoice}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact(!isCompact)}
          devicesCount={smartDevices.length}
          locationCity={userLocation.city || locationWeather.city}
          pendingTasksCount={pendingTasksCount}
          radarAlertsCount={regionalNews.filter((n) => n.severity === 'critical' || n.severity === 'warning').length}
          deviceInfo={deviceInfo}
          deviceMode={deviceMode}
          onToggleDeviceMode={handleToggleDeviceMode}
          onClose={() => {
            if (confirm('J.A.R.V.I.S. oturumunu kapatmak istediğinizden emin misiniz?')) {
              window.location.reload();
            }
          }}
        />
      )}

      {/* 2. Main App Workspace */}
      <main id="jarvis-workspace-container" className="flex-1 overflow-hidden relative flex flex-col">
        {isCompact && !effectiveIsMobile ? (
          /* Mini Floating Assistant Widget Mode for Desktop */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-[#051329]/95 backdrop-blur-lg p-6 rounded-2xl border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(0,210,255,0.3)] flex flex-col items-center max-w-sm text-center">
              <NeuralCoreHUD
                isSpeaking={isSpeaking}
                isListening={isListening}
                locationWeather={locationWeather}
                onRefreshLocation={fetchActiveLocationAndWeather}
                devicesCount={smartDevices.length}
                onOpenRadar={() => {
                  setIsCompact(false);
                  setCurrentView('radar');
                }}
                radarHighlight={`${userLocation.city} (ve Çevre İller): ${regionalNews[0]?.title || 'Gündem ve 1-3 Günlük Projeksiyon'}`}
                nearbyCitiesSummary={userLocation.nearbyCities.join(', ')}
                onPulseCore={() => {
                  if (voiceEnabledState) speakText('Sistemler hazır efendim.');
                }}
              />
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
          /* Full View Router */
          <div className="flex-1 overflow-hidden">
            {/* View 1: HUD & Assistant Conversation */}
            {currentView === 'hud' && (
              <div className={`h-full ${effectiveIsMobile ? 'flex flex-col p-2 space-y-2 overflow-y-auto' : 'grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden'}`}>
                {/* Neural Core HUD with Active Location & Environment */}
                <div className={`${effectiveIsMobile ? 'w-full shrink-0' : 'lg:col-span-5 flex flex-col justify-between'} bg-[#051022]/80 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,180,255,0.1)] overflow-y-auto`}>
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-['Orbitron'] text-xs font-bold text-cyan-200 tracking-wider">
                        J.A.R.V.I.S. ASİSTAN MERKEZİ
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-mono">ÇEVRİMİÇİ</span>
                    </div>
                  </div>

                  <NeuralCoreHUD
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    locationWeather={locationWeather}
                    onRefreshLocation={fetchActiveLocationAndWeather}
                    devicesCount={smartDevices.length}
                    onOpenRadar={() => setCurrentView('radar')}
                    radarHighlight={`${userLocation.city} (ve Çevre İller): ${regionalNews[0]?.title || 'Gündem ve 1-3 Günlük Projeksiyon'}`}
                    nearbyCitiesSummary={userLocation.nearbyCities.join(', ')}
                    onPulseCore={() => {
                      playCommandSuccess();
                      if (voiceEnabledState) {
                        speakText(`Sistemler devrede efendim. Şu an ${userLocation.formattedLocation || locationWeather.city} konumundasınız, çevre illeriniz ${userLocation.nearbyCities.join(', ')}.`);
                      }
                    }}
                  />

                  {/* Quick Hub Navigation Cards */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4 font-mono text-xs">
                    <button
                      onClick={() => setCurrentView('radar')}
                      className="p-2 rounded-lg bg-[#071936] hover:bg-emerald-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-emerald-400/70">RADAR</div>
                      <div className="font-bold text-emerald-200 mt-0.5">Gündem</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('planner')}
                      className="p-2 rounded-lg bg-[#071936] hover:bg-sky-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-sky-400/70">AJANDA</div>
                      <div className="font-bold text-sky-200 mt-0.5">{pendingTasksCount} Görev</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('notes')}
                      className="p-2 rounded-lg bg-[#071936] hover:bg-violet-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-violet-400/70">NOTLAR</div>
                      <div className="font-bold text-violet-200 mt-0.5">{notes.length} Not</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('smarthome')}
                      className="p-2 rounded-lg bg-[#071936] hover:bg-cyan-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-cyan-400/70">AKILLI EV</div>
                      <div className="font-bold text-cyan-200 mt-0.5">{smartDevices.length} Cihaz</div>
                    </button>
                    <button
                      onClick={() => setCurrentView('tools')}
                      className="p-2 rounded-lg bg-[#071936] hover:bg-amber-500/20 border border-cyan-500/30 text-center transition-all cursor-pointer"
                    >
                      <div className="text-[10px] text-amber-400/70">ARAÇLAR</div>
                      <div className="font-bold text-amber-200 mt-0.5">Çevirmen</div>
                    </button>
                  </div>
                </div>

                {/* Right / Bottom: J.A.R.V.I.S. AI & Voice Assistant Console */}
                <div className={`${effectiveIsMobile ? 'flex-1 min-h-[360px]' : 'lg:col-span-7 h-full'} overflow-hidden`}>
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

            {/* View: Regional News & Forecasting Radar */}
            {currentView === 'radar' && (
              <RegionalRadarView
                location={userLocation}
                onUpdateLocation={(newLoc) => {
                  setUserLocation((prev) => {
                    const updated = { ...prev, ...newLoc };
                    fetchRegionalNews(updated.city, updated.district, updated.nearbyCities);
                    return updated;
                  });
                }}
                onRefreshLocationGPS={fetchActiveLocationAndWeather}
                newsList={regionalNews}
                onRefreshNewsAI={() => {
                  fetchRegionalNews(userLocation.city, userLocation.district, userLocation.nearbyCities);
                }}
                isLoadingNews={isLoadingNews}
                isSpeaking={isSpeaking}
                briefingText={radarBriefing}
              />
            )}

            {/* View 2: Task Planner */}
            {currentView === 'planner' && (
              <PlannerView
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onJarvisBriefing={handleJarvisBriefing}
                isMobile={effectiveIsMobile}
              />
            )}

            {/* View 3: Voice Notes */}
            {currentView === 'notes' && (
              <NotesView
                notes={notes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                isMobile={effectiveIsMobile}
              />
            )}

            {/* View 4: AI Multifunctional Tools (Translator, Writer, Calc, Routines) */}
            {currentView === 'tools' && (
              <AiToolsView
                onApplyScene={handleApplyScene}
                onSaveNote={(title, content) => {
                  handleAddNote({
                    title,
                    content,
                    category: 'project',
                    tags: ['Yapay Zeka Taslağı'],
                    pinned: false
                  });
                }}
                isMobile={effectiveIsMobile}
              />
            )}

            {/* View 5: Smart Home Management */}
            {currentView === 'smarthome' && (
              <SmartHomeView
                devices={smartDevices}
                onUpdateDevice={handleUpdateSmartDevice}
                onAddDevice={handleAddSmartDevice}
                onDeleteDevice={handleDeleteSmartDevice}
                onApplyScene={handleApplyScene}
              />
            )}

            {/* View 6: File Explorer */}
            {currentView === 'files' && (
              <FileExplorerView
                files={filesList}
                onUploadFile={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                onSendToTransfer={handleSendToTransfer}
                onJarvisAnalyze={handleJarvisAnalyzeFile}
              />
            )}

            {/* View 7: Data Transfer */}
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

        {/* Windows Start Menu Popup (Desktop mode only) */}
        {!effectiveIsMobile && showStartMenu && (
          <div className="absolute bottom-12 left-3 w-80 bg-[#06142a]/95 backdrop-blur-xl border border-cyan-400/50 rounded-xl p-4 shadow-[0_0_30px_rgba(0,210,255,0.25)] z-50 text-xs font-mono">
            <div className="flex items-center space-x-3 pb-3 border-b border-cyan-500/30">
              <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 font-['Orbitron']">KULLANICI ÇALIŞMA ALANI</div>
                <div className="text-[10px] text-cyan-400/70">J.A.R.V.I.S. Windows Asistanı</div>
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
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>J.A.R.V.I.S. Asistan Paneli</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('radar');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Bölgesel Radar & Haberler</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('planner');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Ajanda & Görev Planlayıcı</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('notes');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Sesli Not Defteri</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('tools');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>AI Çevirmen & Metin Yazarı</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('smarthome');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Akıllı Ev Cihaz Kontrolü</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('files');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <FolderKanban className="w-4 h-4 text-amber-400" />
                <span>Windows Dosya Gezgini</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('transfer');
                  setShowStartMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-500/20 text-cyan-200 flex items-center space-x-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Veri Aktarımı & Senkronizasyon</span>
              </button>
            </div>

            <div className="pt-2 border-t border-cyan-500/30 flex justify-between items-center text-[10px] text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{locationWeather.city}</span>
              </span>
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

      {/* 3. Footer: Either Mobile Navigation Dock OR Desktop Windows Taskbar */}
      {effectiveIsMobile ? (
        <MobileNavigationDock
          currentView={currentView}
          onViewChange={(v) => setCurrentView(v)}
          isListening={isListening}
          onToggleVoiceMic={handleToggleVoiceMic}
          pendingTasksCount={pendingTasksCount}
          devicesCount={smartDevices.length}
          radarAlertsCount={regionalNews.filter((n) => n.severity === 'critical' || n.severity === 'warning').length}
        />
      ) : (
        <SystemTelemetryBar
          onStartMenuClick={() => setShowStartMenu(!showStartMenu)}
          locationCity={locationWeather.city}
          devicesCount={smartDevices.length}
          platformName={deviceInfo.platformName}
          batteryLevel={deviceInfo.batteryLevel}
          isCharging={deviceInfo.isCharging}
        />
      )}
    </div>
  );
}
