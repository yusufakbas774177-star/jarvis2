export type SystemView = 'hud' | 'smarthome' | 'files' | 'transfer';

export interface SmartDevice {
  id: string;
  name: string;
  room: 'living_room' | 'lab' | 'bedroom' | 'garage' | 'power_grid';
  type: 'light' | 'thermostat' | 'lock' | 'audio' | 'power' | 'defense';
  state: boolean;
  value?: number; // temperature, brightness, volume, power MW
  unit?: string;
  color?: string;
  details?: string;
  lastUpdated?: string;
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
  protocol: 'Stark Quantum Tunnel' | 'Orbital Satellite Uplink' | 'Local Mesh RF' | 'Direct Fiber Link';
  progress: number; // 0 to 100
  speed: string;
  status: 'PENDING' | 'TRANSFERRING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  cipher: 'STARK-SHA-512' | 'AES-256-GCM' | 'NANOTECH-QUANTUM';
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
