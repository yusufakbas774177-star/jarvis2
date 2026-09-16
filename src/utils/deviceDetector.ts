import { DeviceInfo } from '../types';

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      deviceType: 'desktop',
      platformName: 'Masaüstü PC',
      screenResolution: '1920x1080',
      orientation: 'landscape',
      batteryLevel: null,
      isCharging: null,
      networkType: 'Ethernet / Çevrimiçi',
      isOnline: true,
      touchSupported: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isWindows = /Windows NT/i.test(ua);
  const isMac = /Macintosh/i.test(ua) && !isIPad;
  const isLinux = /Linux/i.test(ua) && !isAndroid;

  const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const orientation = screenH > screenW ? 'portrait' : 'landscape';

  let deviceType: 'phone' | 'tablet' | 'desktop' = 'desktop';
  let platformName = 'Masaüstü Bilgisayar (PC)';

  if (isIPhone) {
    deviceType = 'phone';
    platformName = 'Apple iPhone (iOS)';
  } else if (isIPad) {
    deviceType = 'tablet';
    platformName = 'Apple iPad (iPadOS)';
  } else if (isAndroid) {
    if (screenW < 768) {
      deviceType = 'phone';
      platformName = 'Android Akıllı Telefon';
    } else {
      deviceType = 'tablet';
      platformName = 'Android Tablet';
    }
  } else if (screenW <= 768 && touchSupported) {
    deviceType = 'phone';
    platformName = 'Mobil Cihaz';
  } else if (isWindows) {
    platformName = 'Windows Masaüstü PC';
  } else if (isMac) {
    platformName = 'Apple macOS Masaüstü';
  } else if (isLinux) {
    platformName = 'Linux İş İstasyonu';
  }

  const isMobile = deviceType === 'phone' || deviceType === 'tablet' || screenW < 768;

  // Network info
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  let networkType = navigator.onLine ? 'Aktif İnternet (Çevrimiçi)' : 'Bağlantı Kesik (Çevrimdışı)';
  if (conn?.effectiveType) {
    networkType = `${conn.effectiveType.toUpperCase()} Ağ Bağlantısı`;
  }

  return {
    isMobile,
    deviceType,
    platformName,
    screenResolution: `${window.screen.width || screenW}x${window.screen.height || screenH}`,
    orientation,
    batteryLevel: null,
    isCharging: null,
    networkType,
    isOnline: navigator.onLine,
    touchSupported,
    width: screenW,
    height: screenH,
  };
}

export async function requestBatteryStatus(): Promise<{ level: number | null; charging: boolean | null }> {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    }
  } catch {
    // Battery API not supported or permissions restricted
  }
  return { level: null, charging: null };
}
