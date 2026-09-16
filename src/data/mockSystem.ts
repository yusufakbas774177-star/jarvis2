import { SmartDevice, FileItem, TransferJob } from '../types';

export const INITIAL_SMART_DEVICES: SmartDevice[] = [
  // Living Room
  {
    id: 'lr_light_main',
    name: 'Salon Ambiyans Işıkları',
    room: 'living_room',
    type: 'light',
    state: true,
    value: 85,
    unit: '%',
    color: '#00e5ff',
    details: 'Holografik tavan LED matrisi'
  },
  {
    id: 'lr_thermo',
    name: 'Salon Termostatı & İklimlendirme',
    room: 'living_room',
    type: 'thermostat',
    state: true,
    value: 22,
    unit: '°C',
    details: 'Çift yönlü hava akışı, nem %45'
  },
  {
    id: 'lr_sound',
    name: 'Stark Akustik Ses Sistemi',
    room: 'living_room',
    type: 'audio',
    state: true,
    value: 60,
    unit: '%',
    details: 'AC/DC - Shoot to Thrill (320kbps)'
  },
  {
    id: 'lr_blinds',
    name: 'Akıllı Cam Polarizasyonu',
    room: 'living_room',
    type: 'lock',
    state: false,
    details: 'Güneş koruması şeffaf modda'
  },

  // Stark Lab / Atölye
  {
    id: 'lab_lights',
    name: 'Atölye Hologram Projektörleri',
    room: 'lab',
    type: 'light',
    state: true,
    value: 100,
    unit: '%',
    color: '#38bdf8',
    details: '3D CAD render aydınlatması aktif'
  },
  {
    id: 'lab_door',
    name: 'Laboratuvar Zırhlı Kapısı',
    room: 'lab',
    type: 'lock',
    state: true,
    details: 'Retina & parmak izi kilidi devrede'
  },
  {
    id: 'lab_exhaust',
    name: 'Nanotek Havalandırma & Vakum',
    room: 'lab',
    type: 'power',
    state: true,
    value: 99,
    unit: '%',
    details: 'Partikül filtresi %99.98 temiz'
  },
  {
    id: 'lab_armor_stand',
    name: 'Mark 85 Zırh Şarj İstasyonu',
    room: 'lab',
    type: 'power',
    state: true,
    value: 94,
    unit: '%',
    details: 'Hızlı Ark indüksiyon şarjı'
  },

  // Bedroom
  {
    id: 'bed_lights',
    name: 'Yatak Odası Dinlenme Işıkları',
    room: 'bedroom',
    type: 'light',
    state: false,
    value: 30,
    unit: '%',
    color: '#f59e0b',
    details: 'Sirkadiyen ritim modu'
  },
  {
    id: 'bed_thermo',
    name: 'Yatak Odası Sıcaklığı',
    room: 'bedroom',
    type: 'thermostat',
    state: true,
    value: 20,
    unit: '°C',
    details: 'Gece uyku optimizasyonu aktif'
  },

  // Security & Garage
  {
    id: 'sec_front_lock',
    name: 'Ana Giriş Çelik Biyometrik Kilit',
    room: 'garage',
    type: 'lock',
    state: true,
    details: 'Tony Stark & Yetkili İzinler Açık'
  },
  {
    id: 'sec_garage_door',
    name: 'Garaj Hidrolik Kapısı & Asansör',
    room: 'garage',
    type: 'lock',
    state: false,
    details: 'Audi R8 & Hot Rod araç platformu hazır'
  },
  {
    id: 'sec_drones',
    name: 'Çevre Güvenlik Dronları (S.T.A.R.K.)',
    room: 'garage',
    type: 'defense',
    state: true,
    value: 4,
    unit: 'Devriye',
    details: 'Malibu sahil şeridi taranıyor'
  },

  // Arc Reactor Grid
  {
    id: 'grid_arc_reactor',
    name: 'Malibu Ana Ark Reaktörü',
    room: 'power_grid',
    type: 'power',
    state: true,
    value: 3200,
    unit: 'MW',
    details: 'Termonükleer plazma çıkışı kararlı'
  },
  {
    id: 'grid_battery_bank',
    name: 'Süperiletken Batarya Rezervleri',
    room: 'power_grid',
    type: 'power',
    state: true,
    value: 98,
    unit: '%',
    details: '36 saat kesintisiz acil durum gücü'
  }
];

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
        id: 'c_users_tony',
        name: 'Users\\TonyStark\\Documents',
        path: 'C:\\Users\\TonyStark\\Documents',
        drive: 'C:',
        type: 'folder',
        size: '14.8 GB',
        sizeBytes: 15891398656,
        modified: '2026-09-15 18:45',
        securityClearance: 'Level 1',
        children: [
          {
            id: 'f_automation_config',
            name: 'Malibu_Estate_Automation.json',
            path: 'C:\\Users\\TonyStark\\Documents\\Malibu_Estate_Automation.json',
            drive: 'C:',
            type: 'file',
            extension: 'json',
            size: '42.6 KB',
            sizeBytes: 43622,
            modified: '2026-09-16 09:12',
            securityClearance: 'Level 4',
            content: `{\n  "property": "Malibu Point 10880",\n  "ai_core": "J.A.R.V.I.S. Mark VII",\n  "subsystems": {\n    "arc_grid_link": true,\n    "holographic_tables": 4,\n    "nano_lab_isolation": "ACTIVE",\n    "emergency_evacuation_route": "Bunker_Sublevel_3"\n  },\n  "authorized_biometrics": [\n    "Anthony Edward Stark",\n    "Virginia Pepper Potts",\n    "James Rupert Rhodes"\n  ]\n}`
          },
          {
            id: 'f_clean_slate_notes',
            name: 'Clean_Slate_Protocol_Notes.txt',
            path: 'C:\\Users\\TonyStark\\Documents\\Clean_Slate_Protocol_Notes.txt',
            drive: 'C:',
            type: 'file',
            extension: 'txt',
            size: '12.8 KB',
            sizeBytes: 13107,
            modified: '2026-09-14 23:40',
            securityClearance: 'Level 7 - Tony Only',
            content: `--- STARK ENTERPRISES GİZLİ DOKÜMAN ---\nPROTOKOL: CLEAN SLATE (TEMİZ SAYFA)\n\nTüm bağımsız zırh üniteleri (Mark 1 - Mark 49) acil bir tehdit anında koordineli olarak havaya uçurulabilir veya tek bir komutla devre dışı bırakılabilir.\nYetkilendirme Kodu: STARK-42-VIBRANIUM\nSon Test Tarihi: Başarılı.\nNot: JARVIS, bu komut verildiğinde önce sözlü teyit almalı.`
          },
          {
            id: 'f_jarvis_speech_config',
            name: 'Jarvis_Neural_Voice_Model.cfg',
            path: 'C:\\Users\\TonyStark\\Documents\\Jarvis_Neural_Voice_Model.cfg',
            drive: 'C:',
            type: 'file',
            extension: 'cfg',
            size: '8.4 KB',
            sizeBytes: 8601,
            modified: '2026-09-15 14:15',
            securityClearance: 'Level 4',
            content: `[Voice_Engine]\nActor="Paul Bettany Matrix"\nPrimary_Language="tr-TR / en-GB"\nPitched_Frequency=142.5Hz\nCourtesy_Factor=1.0\nWit_Sarcasm_Index=0.45\nStatus="OPTIMAL"`
          }
        ]
      },
      {
        id: 'c_desktop',
        name: 'Users\\TonyStark\\Desktop',
        path: 'C:\\Users\\TonyStark\\Desktop',
        drive: 'C:',
        type: 'folder',
        size: '1.2 GB',
        sizeBytes: 1288490188,
        modified: '2026-09-16 11:30',
        securityClearance: 'Level 1',
        children: [
          {
            id: 'f_flight_stabilizer_cpp',
            name: 'Flight_Stabilizer_Matrix.cpp',
            path: 'C:\\Users\\TonyStark\\Desktop\\Flight_Stabilizer_Matrix.cpp',
            drive: 'C:',
            type: 'file',
            extension: 'cpp',
            size: '18.9 KB',
            sizeBytes: 19353,
            modified: '2026-09-16 08:30',
            securityClearance: 'Level 4',
            content: `#include <stark/avionics.h>\n\nvoid computeRepulsorVectors(Vector3d& thrust, double altitudeMeters) {\n    if (altitudeMeters > 25000.0) {\n        // Atmospheric freeze risk mitigation\n        activateIcingCountermeasures();\n    }\n    thrust.z = calculateCounterGravMomentum(thrust.magnitude());\n}`
          }
        ]
      }
    ]
  },

  // Drive D: Stark Vault
  {
    id: 'd_root',
    name: 'D: [Stark_Vault_Encrypted]',
    path: 'D:\\',
    drive: 'D:',
    type: 'folder',
    size: '892.5 GB',
    sizeBytes: 958322671616,
    modified: '2026-09-16 12:00',
    securityClearance: 'Level 7 - Tony Only',
    children: [
      {
        id: 'd_mark85',
        name: 'Mark_LXXXV_Nanotech_Mesh.cad',
        path: 'D:\\Mark_LXXXV_Nanotech_Mesh.cad',
        drive: 'D:',
        type: 'file',
        extension: 'cad',
        size: '482.4 MB',
        sizeBytes: 505829376,
        modified: '2026-09-16 07:15',
        isEncrypted: true,
        securityClearance: 'Level 7 - Tony Only',
        content: `// STARK INDUSTRIES 3D CAD NANOTECH BLUEPRINT\n// MODEL: MARK 85 (ENDGAME EDITION)\n// MATERIAL: TITANIUM-GOLD ALLOY WITH NANO-PARTICLE FLUID INJECTION\n// ENERGY SOURCE: CHEST-MOUNTED ARC REACTOR (NEW ELEMENT SYNTHESIS)\n// REPELLENT SHIELDS: DUAL PHASE IONIC CANOPY\n// STATUS: READY FOR COMBAT DEPLOYMENT`
      },
      {
        id: 'd_arc_formula',
        name: 'Arc_Reactor_Synthesis_Formula.py',
        path: 'D:\\Arc_Reactor_Synthesis_Formula.py',
        drive: 'D:',
        type: 'file',
        extension: 'py',
        size: '24.1 KB',
        sizeBytes: 24678,
        modified: '2026-09-15 22:04',
        isEncrypted: true,
        securityClearance: 'Level 7 - Tony Only',
        content: `import numpy as np\nimport stark_quantum as sq\n\ndef synthesize_new_element(isotope_decay_rate=0.0014):\n    """Calculates non-decaying palladium substitute via proton beam collider."""\n    beam_energy_gev = 12.4\n    lattice_resonance = sq.calculate_palladium_alternative(beam_energy_gev)\n    print("[J.A.R.V.I.S.] New element lattice confirmed stable. Energy output: 3.2 GigaWatts.")\n    return lattice_resonance\n\nif __name__ == '__main__':\n    synthesize_new_element()`
      },
      {
        id: 'd_friday_backup',
        name: 'F.R.I.D.A.Y._Neural_Redundancy.bin',
        path: 'D:\\F.R.I.D.A.Y._Neural_Redundancy.bin',
        drive: 'D:',
        type: 'file',
        extension: 'bin',
        size: '1.2 GB',
        sizeBytes: 1288490188,
        modified: '2026-09-13 11:20',
        isEncrypted: true,
        securityClearance: 'Level 7 - Tony Only',
        content: `[BINARY ENCRYPTED RECOVERY IMAGE - SHA512: 8f4a129dcb0923e4]`
      },
      {
        id: 'd_avenger_comms',
        name: 'Avengers_Encrypted_Emergency_Line.log',
        path: 'D:\\Avengers_Encrypted_Emergency_Line.log',
        drive: 'D:',
        type: 'file',
        extension: 'log',
        size: '64.2 KB',
        sizeBytes: 65740,
        modified: '2026-09-16 11:45',
        isEncrypted: false,
        securityClearance: 'Avenger Clearance',
        content: `[2026-09-16 04:12] Uplink established with Wakanda Royal Network.\n[2026-09-16 08:30] Bruce Banner pinged quantum particle collider.\n[2026-09-16 11:15] JARVIS: All orbital satellites nominal.`
      }
    ]
  },

  // Drive Z: Orbital Relay
  {
    id: 'z_root',
    name: 'Z: [Orbital_Satellite_Relay]',
    path: 'Z:\\',
    drive: 'Z:',
    type: 'folder',
    size: '4.8 TB',
    sizeBytes: 5277655813324,
    modified: '2026-09-16 12:45',
    securityClearance: 'Avenger Clearance',
    children: [
      {
        id: 'z_telemetry',
        name: 'Telemetry_Low_Earth_Orbit_2026.csv',
        path: 'Z:\\Telemetry_Low_Earth_Orbit_2026.csv',
        drive: 'Z:',
        type: 'file',
        extension: 'csv',
        size: '184.2 MB',
        sizeBytes: 193146880,
        modified: '2026-09-16 12:40',
        securityClearance: 'Level 4',
        content: `TIMESTAMP,ORBIT_ALT_KM,VELOCITY_KMS,SOLAR_CHARGE_PCT,PING_MS\n2026-09-16T12:00:00Z,420.5,7.66,99.4,4.2\n2026-09-16T12:15:00Z,420.4,7.66,99.2,3.8\n2026-09-16T12:30:00Z,420.6,7.67,99.5,4.0\n2026-09-16T12:45:00Z,420.5,7.66,99.8,3.9`
      },
      {
        id: 'z_quantum_table',
        name: 'StarkNet_Quantum_Routing.xml',
        path: 'Z:\\StarkNet_Quantum_Routing.xml',
        drive: 'Z:',
        type: 'file',
        extension: 'xml',
        size: '128.5 KB',
        sizeBytes: 131584,
        modified: '2026-09-16 09:00',
        securityClearance: 'Level 4',
        content: `<?xml version="1.0" encoding="UTF-8"?>\n<StarkRoutingTable nodes="18" meshProtocol="QUANTUM_TUNNEL">\n  <Node id="MALIBU_PRIMARY" latency="0.4ms" status="ACTIVE"/>\n  <Node id="STARK_TOWER_NYC" latency="12.2ms" status="ACTIVE"/>\n  <Node id="VERONICA_ORBITAL" latency="34.8ms" status="SYNCED"/>\n</StarkRoutingTable>`
      }
    ]
  }
];

export const INITIAL_TRANSFERS: TransferJob[] = [
  {
    id: 'TX-9041',
    filename: 'Mark_LXXXV_Nanotech_Mesh.cad',
    size: '482.4 MB',
    sizeBytes: 505829376,
    source: 'Yerel Bilgisayar (D:\\Stark_Vault)',
    destination: 'Stark Orbital Uydu İstasyonu (Veronica)',
    protocol: 'Stark Quantum Tunnel',
    progress: 76,
    speed: '1.42 GB/s',
    status: 'TRANSFERRING',
    cipher: 'STARK-SHA-512',
    startedAt: '12:48:10',
    eta: '3.4 sn'
  },
  {
    id: 'TX-8920',
    filename: 'Malibu_Estate_Telemetry.enc',
    size: '124.8 MB',
    sizeBytes: 130862284,
    source: 'Akıllı Ev Sensör Matrisi',
    destination: 'Stark Secure Cloud (Avenger Vault)',
    protocol: 'Orbital Satellite Uplink',
    progress: 100,
    speed: '890 MB/s',
    status: 'COMPLETED',
    cipher: 'AES-256-GCM',
    startedAt: '12:40:02',
    eta: 'Tamamlandı'
  }
];
