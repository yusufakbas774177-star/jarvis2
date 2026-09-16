export type SystemView = 'hud' | 'planner' | 'notes' | 'tools' | 'smarthome' | 'files' | 'transfer' | 'radar';

export type DeviceMode = 'auto' | 'mobile' | 'desktop';

export type TimeHorizon = 'today' | '1-3-days' | '7-8-days';
export type NewsCategory = 'all' | 'transport' | 'weather_alert' | 'infrastructure' | 'civic_agenda' | 'economy_events';
export type NewsSeverity = 'critical' | 'warning' | 'info' | 'upcoming';

export interface RegionalNewsItem {
  id: string;
  title: string;
  summary: string;
  city: string; // e.g. "Yalova", "Kocaeli", "Bursa", "İstanbul"
  district?: string; // e.g. "Altınova", "Gebze", "Osmangazi", "Pendik"
  timeHorizon: TimeHorizon; // 'today' | '1-3-days' | '7-8-days'
  timeHorizonLabel: string; // "Bugün (Canlı)", "1-3 Gün İçi", "7-8 Gün İçi"
  forecastDate: string; // e.g. "Bugün, 16 Eylül", "18-19 Eylül (2 gün sonra)", "23-24 Eylül"
  category: NewsCategory;
  categoryLabel: string; // "Ulaşım & Feribot", "Hava & Güvenlik Uyarısı", "Altyapı & Kesintiler", vb.
  severity: NewsSeverity;
  source: string;
  impact?: string;
  actionRecommendation?: string;
  isNeighboringCity?: boolean;
}

export interface UserLocationDetails {
  city: string;
  district: string;
  province: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  nearbyCities: string[];
  formattedLocation: string;
}

export interface DeviceInfo {
  isMobile: boolean;
  deviceType: 'phone' | 'tablet' | 'desktop';
  platformName: string; // e.g. 'Android Telefon', 'iPhone', 'Windows PC'
  screenResolution: string;
  orientation: 'portrait' | 'landscape';
  batteryLevel: number | null; // e.g. 85
  isCharging: boolean | null;
  networkType: string;
  isOnline: boolean;
  touchSupported: boolean;
  width?: number;
  height?: number;
}

export interface AssistantTask {
  id: string;
  title: string;
  description?: string;
  time?: string;
  dueTime?: string;
  category: 'work' | 'personal' | 'health' | 'home';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate: string;
  createdAt?: string;
}

export interface AssistantNote {
  id: string;
  title: string;
  content: string;
  date?: string;
  updatedAt?: string;
  category?: 'quick' | 'project' | 'personal' | 'meeting';
  tags: string[];
  pinned?: boolean;
  summary?: string;
}

export interface SmartDevice {
  id: string;
  name: string;
  room: string; // User-defined room name (e.g., Salon, Yatak Odası, Çalışma Odası, Mutfak)
  type: 'light' | 'thermostat' | 'lock' | 'audio' | 'power' | 'tv' | 'fan' | 'vacuum';
  state: boolean;
  value?: number; // temperature, brightness, volume, etc.
  unit?: string;
  color?: string;
  details?: string;
  lastUpdated?: string;
  ipAddress?: string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  drive: 'C:' | 'D:' | 'Z:' | 'LOCAL:';
  type: 'file' | 'folder';
  size: string;
  sizeBytes: number;
  extension?: string;
  modified: string;
  isEncrypted?: boolean;
  securityClearance?: 'Level 1' | 'Level 4' | 'Level 7 - Tony Only' | 'Avenger Clearance';
  content?: string;
  children?: FileItem[];
  realHandle?: any; // Native FileSystemHandle if available
}

export interface TransferJob {
  id: string;
  filename: string;
  size: string;
  sizeBytes: number;
  source: string;
  destination: string;
  protocol: 'Stark Quantum Tunnel' | 'Orbital Satellite Uplink' | 'Local Mesh RF' | 'Direct Fiber Link' | 'Encrypted VPN' | 'Local P2P';
  progress: number; // 0 to 100
  speed: string;
  status: 'PENDING' | 'TRANSFERRING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  cipher: 'STARK-SHA-512' | 'AES-256-GCM' | 'NANOTECH-QUANTUM' | 'TLS-1.3';
  startedAt: string;
  eta: string;
}

export interface JarvisAction {
  type: 'SMART_HOME_CONTROL' | 'FILE_OPERATION' | 'DATA_TRANSFER' | 'SYSTEM_DIAGNOSTIC' | 'CREATE_TASK' | 'CREATE_NOTE' | 'WEATHER_QUERY' | 'VIEW_REGIONAL_RADAR' | 'READ_NEWS_BRIEFING';
  target: string;
  value: any;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  actions?: JarvisAction[];
  isVoice?: boolean;
}
