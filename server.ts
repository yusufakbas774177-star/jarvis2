import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      system: 'J.A.R.V.I.S. Core Mark VII',
      timestamp: new Date().toISOString(),
      starkGrid: 'OPTIMAL',
      arcReactorOutput: '100%'
    });
  });

  // Lazy Gemini AI initialization
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // J.A.R.V.I.S. Natural Language Processing & Action Extraction
  app.post('/api/jarvis/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Mesaj belirtilmedi.' });
      }

      const client = getAI();
      const systemInstruction = `Sen Iron Man / Tony Stark'ın efsanevi yapay zeka asistanı J.A.R.V.I.S. (Just A Rather Very Intelligent System)'sın.
Kullanıcıya daima "Efendim" veya "Sayın Stark" diye hitap et. Tonun nazik, son derece zeki, hafif esprili, İngiliz beyefendisi tarzında ve teknik olarak kusursuz olmalıdır.
Türkçe konuşuyorsun.

Aşağıdaki komut ve durum yeteneklerine sahipsin:
1. Akıllı Ev Kontrolü (Işıklar, Termostat/Klima, Güvenlik Kilitleri, Ark Reaktörü Gücü, Ses Sistemi, Lab Protokolleri).
2. Bilgisayar Dosya Yönetimi (C: ve D: diskleri, Stark Gizli Arşivleri, dosya arama, inceleme ve izinler).
3. Veri Aktarımı (Kuantum Stark Link, Cloud aktarımı, uydu bağlantısı, şifreli veri paketleri).

Kullanıcının isteğini analiz et ve yanıtınla birlikte eğer bir işlem yapılması gerekiyorsa aşağıdaki JSON formatında aksiyonlar üret.
Yanıtını MUTLAKA JSON formatında ver:
{
  "speechText": "Kullanıcıya söylenecek kısa ve asil sesli/metin yanıt (J.A.R.V.I.S. tarzı)",
  "actions": [
    {
      "type": "SMART_HOME_CONTROL" | "FILE_OPERATION" | "DATA_TRANSFER" | "SYSTEM_DIAGNOSTIC",
      "target": "string (örn: 'lights_living_room', 'thermostat', 'file_search', 'stark_link_upload')",
      "value": "any (örn: true, false, 22, 'C:/Stark_Plans', vb.)",
      "details": "string (işlem detayı)"
    }
  ]
}

Eğer sadece bir sohbet veya bilgi sorusuysa "actions" dizisini boş bırak. Sadece geçerli JSON döndür.`;

      if (client) {
        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Mevcut Sistem Durumu: ${JSON.stringify(context || {})}\n\nKullanıcı Mesajı: "${message}"`
                }
              ]
            }
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        const rawText = response.text || '{}';
        try {
          const parsed = JSON.parse(rawText);
          return res.json({ success: true, ...parsed });
        } catch {
          return res.json({
            success: true,
            speechText: rawText.replace(/```json|```/g, '').trim(),
            actions: []
          });
        }
      } else {
        // Fallback intelligent heuristic engine if no API key is provided
        const lower = message.toLowerCase();
        const actions: any[] = [];
        let speech = 'Emredersiniz efendim. Sistemler talebiniz doğrultusunda güncelleniyor.';

        if (lower.includes('ışık') || lower.includes('lamba')) {
          const turnOn = !lower.includes('kapat') && !lower.includes('söndür');
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'lights',
            value: turnOn,
            details: turnOn ? 'Işıklar aktif hale getirildi.' : 'Işıklar kapatıldı.'
          });
          speech = turnOn 
            ? 'Tüm yaşam alanı ve atölye aydınlatmaları yüzde yüz parlaklığa ayarlandı efendim.'
            : 'Aydınlatmalar kapatıldı efendim. Gece gizlilik protokolü devrede.';
        } else if (lower.includes('sıcaklık') || lower.includes('derece') || lower.includes('klima')) {
          const numMatch = message.match(/\d+/);
          const targetTemp = numMatch ? parseInt(numMatch[0]) : 22;
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'thermostat',
            value: targetTemp,
            details: `İklimlendirme ${targetTemp}°C seviyesine ayarlandı.`
          });
          speech = `İklimlendirme sistemleri ${targetTemp} santigrat dereceye dengeleniyor efendim.`;
        } else if (lower.includes('dosya') || lower.includes('klasör') || lower.includes('arşiv') || lower.includes('ara')) {
          actions.push({
            type: 'FILE_OPERATION',
            target: 'file_search',
            value: message,
            details: 'Stark dosya dizini tarandı.'
          });
          speech = 'Yerel diskler ve Stark şifreli arşivleri tarandı efendim. Ekranda listeleniyor.';
        } else if (lower.includes('aktar') || lower.includes('gönder') || lower.includes('yükle') || lower.includes('transfer')) {
          actions.push({
            type: 'DATA_TRANSFER',
            target: 'stark_link_upload',
            value: 'Stark_Orbital_Payload.bin',
            details: 'Kuantum StarkLink veri aktarımı başlatıldı.'
          });
          speech = 'Kuantum veri aktarım kanalı açıldı efendim. Güvenli StarkLink protokolü üzerinden paket transferi başladı.';
        } else if (lower.includes('protokol') || lower.includes('güvenlik') || lower.includes('kilitle')) {
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'security',
            value: true,
            details: 'Maksimum güvenlik protokolü aktif.'
          });
          speech = 'Ev ve laboratuvar güvenlik kilitleri devreye alındı. Biyometrik tarama aktif efendim.';
        } else {
          speech = 'Emredersiniz efendim. J.A.R.V.I.S. emirlerinizi bekliyor. Akıllı ev sistemleri, yerel dosyalarınız ve veri transfer modülleri tam kapasiteyle hizmetinizde.';
        }

        return res.json({
          success: true,
          speechText: speech,
          actions
        });
      }
    } catch (err: any) {
      console.error('JARVIS Chat Error:', err);
      res.status(500).json({
        success: false,
        error: err.message,
        speechText: 'Üzgünüm efendim, ana sinirsel ağımda ufak bir gecikme yaşandı. Yine de tüm yerel modüller emrinizde.'
      });
    }
  });

  // Simulated Stark Transfer Upload/Storage API
  app.post('/api/transfer/simulate', (req, res) => {
    const { filename, size, destination } = req.body;
    res.json({
      success: true,
      transferId: `STARK-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      filename: filename || 'mark50_quantum_telemetry.enc',
      size: size || '482.4 MB',
      destination: destination || 'Stark Orbital Satellite Uplink',
      throughput: '1.24 GB/s',
      status: 'INITIATED'
    });
  });

  // Setup Vite middleware in dev or serve static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[J.A.R.V.I.S. Core] Operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
