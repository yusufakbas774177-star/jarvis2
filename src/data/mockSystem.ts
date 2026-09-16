import { SmartDevice, FileItem, TransferJob } from '../types';

// Ev sisteminde başlangıçta hiçbir varsayılan/film ürünü bulunmaz; kullanıcı kendi cihazlarını ekler
export const INITIAL_SMART_DEVICES: SmartDevice[] = [];

export const INITIAL_FILES: FileItem[] = [
  // Drive C:
  {
    id: 'c_root',
    name: 'C: [Windows_OS]',
    path: 'C:\\',
    drive: 'C:',
    type: 'folder',
    size: '184.2 GB',
    sizeBytes: 197787402240,
    modified: '2026-09-16 10:20',
    securityClearance: 'Level 1',
    children: [
      {
        id: 'c_users_user',
        name: 'Users\\Kullanici\\Documents',
        path: 'C:\\Users\\Kullanici\\Documents',
        drive: 'C:',
        type: 'folder',
        size: '14.8 GB',
        sizeBytes: 15891398656,
        modified: '2026-09-15 18:45',
        securityClearance: 'Level 1',
        children: [
          {
            id: 'f_automation_config',
            name: 'Akilli_Ev_Yapilandirmasi.json',
            path: 'C:\\Users\\Kullanici\\Documents\\Akilli_Ev_Yapilandirmasi.json',
            drive: 'C:',
            type: 'file',
            extension: 'json',
            size: '24.2 KB',
            sizeBytes: 24780,
            modified: '2026-09-16 09:12',
            securityClearance: 'Level 4',
            content: `{\n  "asistan": "J.A.R.V.I.S. Windows Workstation",\n  "protokol": "Matter / Zigbee / WiFi",\n  "cihaz_sayisi": 0,\n  "otomasyon_durumu": "HAZIR"\n}`
          },
          {
            id: 'f_jarvis_speech_config',
            name: 'Jarvis_Ses_Ayarlari.cfg',
            path: 'C:\\Users\\Kullanici\\Documents\\Jarvis_Ses_Ayarlari.cfg',
            drive: 'C:',
            type: 'file',
            extension: 'cfg',
            size: '4.2 KB',
            sizeBytes: 4300,
            modified: '2026-09-15 14:15',
            securityClearance: 'Level 4',
            content: `[Voice_Engine]\nDil="tr-TR"\nTonlama="Nezaketli & Saygılı"\nDurum="AKTİF"`
          }
        ]
      },
      {
        id: 'c_desktop',
        name: 'Users\\Kullanici\\Desktop',
        path: 'C:\\Users\\Kullanici\\Desktop',
        drive: 'C:',
        type: 'folder',
        size: '1.2 GB',
        sizeBytes: 1288490188,
        modified: '2026-09-16 11:30',
        securityClearance: 'Level 1',
        children: [
          {
            id: 'f_notlar',
            name: 'Gunluk_Gorevler.txt',
            path: 'C:\\Users\\Kullanici\\Desktop\\Gunluk_Gorevler.txt',
            drive: 'C:',
            type: 'file',
            extension: 'txt',
            size: '3.4 KB',
            sizeBytes: 3480,
            modified: '2026-09-16 08:30',
            securityClearance: 'Level 1',
            content: `--- GÜNLÜK ÇALIŞMA NOTLARI ---\n1. Akıllı ev cihazlarını sisteme bağla\n2. Yerel dosya yedeklemesini başlat\n3. J.A.R.V.I.S. sesli komut testlerini yap`
          }
        ]
      }
    ]
  },

  // Drive D: Veri Deposu
  {
    id: 'd_root',
    name: 'D: [Veri_Deposu]',
    path: 'D:\\',
    drive: 'D:',
    type: 'folder',
    size: '892.5 GB',
    sizeBytes: 958322671616,
    modified: '2026-09-16 12:00',
    securityClearance: 'Level 4',
    children: [
      {
        id: 'd_sistem_raporu',
        name: 'Sistem_Analiz_Raporu.py',
        path: 'D:\\Sistem_Analiz_Raporu.py',
        drive: 'D:',
        type: 'file',
        extension: 'py',
        size: '12.4 KB',
        sizeBytes: 12697,
        modified: '2026-09-15 22:04',
        isEncrypted: false,
        securityClearance: 'Level 4',
        content: `import os\nimport platform\n\ndef check_system():\n    print(f"İşletim Sistemi: {platform.system()} {platform.release()}")\n    print("[J.A.R.V.I.S.] Tüm yerel sürücüler ve ağ servisleri nominal.")\n\nif __name__ == '__main__':\n    check_system()`
      }
    ]
  },

  // Drive Z: Güvenli Ağ ve Bulut
  {
    id: 'z_root',
    name: 'Z: [Guvenli_Ag_Depolama]',
    path: 'Z:\\',
    drive: 'Z:',
    type: 'folder',
    size: '4.8 TB',
    sizeBytes: 5277655813324,
    modified: '2026-09-16 12:45',
    securityClearance: 'Level 4',
    children: [
      {
        id: 'z_ag_ayarlari',
        name: 'Guvenli_Ag_Yapilandirmasi.xml',
        path: 'Z:\\Guvenli_Ag_Yapilandirmasi.xml',
        drive: 'Z:',
        type: 'file',
        extension: 'xml',
        size: '18.5 KB',
        sizeBytes: 18944,
        modified: '2026-09-16 09:00',
        securityClearance: 'Level 4',
        content: `<?xml version="1.0" encoding="UTF-8"?>\n<NetworkConfig protocol="TLS_1_3">\n  <Node id="HOME_SERVER" status="ONLINE"/>\n  <Node id="CLOUD_BACKUP" status="SYNCED"/>\n</NetworkConfig>`
      }
    ]
  }
];

export const INITIAL_TRANSFERS: TransferJob[] = [
  {
    id: 'TX-1042',
    filename: 'Akilli_Ev_Yedekleme_Paketi.zip',
    size: '142.8 MB',
    sizeBytes: 149736652,
    source: 'Yerel Bilgisayar (C:\\)',
    destination: 'Güvenli Bulut Sunucusu',
    protocol: 'Direct Fiber Link',
    progress: 100,
    speed: '1.24 GB/s',
    status: 'COMPLETED',
    cipher: 'AES-256-GCM',
    startedAt: '12:40:02',
    eta: 'Tamamlandı'
  }
];
