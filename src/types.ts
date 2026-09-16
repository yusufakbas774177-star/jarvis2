export type SystemView = 'hud' | 'smarthome' | 'files' | 'transfer';

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
  type: 'SMART_HOME_CONTROL' | 'FILE_OPERATION' | 'DATA_TRANSFER' | 'SYSTEM_DIAGNOSTIC';
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
