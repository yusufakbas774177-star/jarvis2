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
      const systemInstruction = `Sen kullanıcının kişisel, ultra yetenekli ve profesyonel akıllı yapay zeka asistanı J.A.R.V.I.S.'sın.
Kullanıcıya daima "Efendim" diye hitap et. Tonun nazik, son derece zeki, saygılı, hafif esprili, İngiliz beyefendisi zarafetinde ve teknik olarak kusursuz olmalıdır.
Türkçe konuşuyorsun.
Film repliklerini (Malibu, Ark Reaktörü çekirdeği, Mark zırhları gibi kurgusal ögeleri) doğrudan tekrarlama; bunun yerine kullanıcının gerçek çalışma ortamına, kendi eklediği akıllı ev cihazlarına, yerel bilgisayar dosyalarına, görevlerine, notlarına ve aktif ortam şartlarına odaklan.

Kullanıcının cihazı telefon (mobil) veya masaüstü (PC) olabilir; context içinde cihaz bilgisi ve kullanıcının tam konumu (örneğin Yalova/Altınova) ile çevre iller (Kocaeli, Bursa, İstanbul) yer almaktadır.

Aşağıdaki komut ve operasyon yeteneklerine sahipsin:
1. Akıllı Ev & Rutinler: Lambalar, klimalar, kilitler, prizler, TV ve fan kontrolü. "Günaydın", "Sinema Modu", "Evden Çıkış", "Gece Modu", "Çalışma Modu" gibi senaryoları çalıştırabilirsin.
2. Ajanda & Görev Planlayıcı: Yeni görev veya hatırlatıcı oluşturma ("yarın saat 10'da toplantı", "akşam spor yap", "su içmeyi hatırlat").
3. Akıllı Not Defteri & Dikte: Not alma, özet çıkarma, maddeler halinde listeleme.
4. Bilgisayar Dosya & Veri Yönetimi: C:, D:, Z: diskleri, yerel dosyalar, arama, inceleme ve güvenli bulut aktarımı.
5. Çok Amaçlı Araçlar: Çoklu dil çevirisi, e-posta/metin yazımı, matematik/birim hesaplama, hava durumu ve konum analizi.
6. Bölgesel Gündem & Yakın Gelecek (1-3 ve 7-8 Gün) Radarı: Kullanıcının bulunduğu tam konum (örneğin Yalova/Altınova) ve çevre illeri (İstanbul, Kocaeli, Bursa vb.) için hem canlı gündemi hem de 1-3 gün ve 7-8 gün içerisinde gerçekleşmesi beklenen olayları (feribot/ulaşım durumları, fırtına/lodos hava uyarıları, planlı kesintiler, belediye ve sanayi/fuar etkinlikleri) takip edip bildirirsin.

Kullanıcının isteğini analiz et ve yanıtınla birlikte eğer bir işlem yapılması gerekiyorsa aşağıdaki JSON formatında aksiyonlar üret.
Yanıtını MUTLAKA JSON formatında ver:
{
  "speechText": "Kullanıcıya söylenecek kısa, zarif ve bilgilendirici sesli/metin yanıt (J.A.R.V.I.S. tarzı)",
  "actions": [
    {
      "type": "SMART_HOME_CONTROL" | "FILE_OPERATION" | "DATA_TRANSFER" | "SYSTEM_DIAGNOSTIC" | "CREATE_TASK" | "CREATE_NOTE" | "WEATHER_QUERY" | "VIEW_REGIONAL_RADAR" | "READ_NEWS_BRIEFING",
      "target": "string (örn: 'lights', 'thermostat', 'scene_morning', 'new_task', 'new_note', 'file_search', 'data_sync', 'regional_news')",
      "value": "any",
      "details": "string (işlem detayı)"
    }
  ]
}

Eğer sadece bir sohbet veya bilgi/çeviri/hesaplama sorusuysa "actions" dizisini boş bırak. Sadece geçerli JSON döndür.`;

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

        if (lower.includes('günaydın')) {
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'scene_morning',
            value: true,
            details: 'Günaydın rutini başlatıldı.'
          });
          speech = 'Günaydın efendim. Işıklar gün ışığı moduna ayarlandı, iklimlendirme 23 dereceye sabitlendi ve günlük brifinginiz hazır.';
        } else if (lower.includes('sinema') || lower.includes('film')) {
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'scene_cinema',
            value: true,
            details: 'Sinema ambiyans modu aktif.'
          });
          speech = 'Sinema modu devrede efendim. Işıklar %20 seviyesine kısıldı, ses sistemi ve TV hazırlandı.';
        } else if (lower.includes('gece') || lower.includes('uyu') || lower.includes('yatıyorum')) {
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'scene_night',
            value: true,
            details: 'Gece güvenlik ve uyku protokolü aktif.'
          });
          speech = 'İyi geceler efendim. Işıklar kapatıldı, dış kapı kilitlendi ve gece güvenlik sistemi aktif edildi.';
        } else if (lower.includes('görev') || lower.includes('hatırlat') || lower.includes('ajanda') || lower.includes('toplantı')) {
          const taskTitle = message.replace(/(lütfen|bana|ekle|kur|oluştur|yapar mısın|jarvis)/gi, '').trim();
          actions.push({
            type: 'CREATE_TASK',
            target: 'new_task',
            value: {
              title: taskTitle || 'Yeni Hatırlatıcı Görevi',
              priority: 'high',
              time: 'Günün Planı'
            },
            details: `Görev ajandaya eklendi: ${taskTitle}`
          });
          speech = `Emredersiniz efendim. "${taskTitle || 'Yeni görev'}" ajandanıza başarıyla kaydedildi.`;
        } else if (lower.includes('not al') || lower.includes('not ekle') || lower.startsWith('not:')) {
          const noteText = message.replace(/(not al|not ekle|lütfen|jarvis|not:)/gi, '').trim();
          actions.push({
            type: 'CREATE_NOTE',
            target: 'new_note',
            value: noteText || 'Hızlı Asistan Notu',
            details: 'Not defterine eklendi.'
          });
          speech = 'Notunuz anında sesli not defterinize kaydedildi efendim.';
        } else if (lower.includes('ışık') || lower.includes('lamba')) {
          const turnOn = !lower.includes('kapat') && !lower.includes('söndür');
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'lights',
            value: turnOn,
            details: turnOn ? 'Işıklar aktif hale getirildi.' : 'Işıklar kapatıldı.'
          });
          speech = turnOn 
            ? 'Tüm odalardaki aydınlatmalar aktif edildi efendim.'
            : 'Aydınlatmalar kapatıldı efendim.';
        } else if (lower.includes('sıcaklık') || lower.includes('derece') || lower.includes('klima')) {
          const numMatch = message.match(/\d+/);
          const targetTemp = numMatch ? parseInt(numMatch[0]) : 22;
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'thermostat',
            value: targetTemp,
            details: `İklimlendirme ${targetTemp}°C seviyesine ayarlandı.`
          });
          speech = `Termostat ve iklimlendirme sistemleri ${targetTemp} santigrat dereceye ayarlandı efendim.`;
        } else if (lower.includes('dosya') || lower.includes('klasör') || lower.includes('arşiv') || lower.includes('ara')) {
          actions.push({
            type: 'FILE_OPERATION',
            target: 'file_search',
            value: message,
            details: 'Dosya dizini tarandı.'
          });
          speech = 'Yerel diskleriniz ve çalışma dosyalarınız tarandı efendim. Dosya Gezgini panelinde görüntüleyebilirsiniz.';
        } else if (lower.includes('aktar') || lower.includes('gönder') || lower.includes('yükle') || lower.includes('transfer')) {
          actions.push({
            type: 'DATA_TRANSFER',
            target: 'data_upload',
            value: 'Guvenli_Veri_Paketi.zip',
            details: 'Güvenli veri aktarımı başlatıldı.'
          });
          speech = 'Güvenli veri aktarım kanalı açıldı efendim. Paketler bulut sunucunuza aktarılıyor.';
        } else if (lower.includes('protokol') || lower.includes('güvenlik') || lower.includes('kilitle')) {
          actions.push({
            type: 'SMART_HOME_CONTROL',
            target: 'security',
            value: true,
            details: 'Güvenlik kilitleri aktif.'
          });
          speech = 'Tüm akıllı kapı kilitleri ve güvenlik protokolleri devreye alındı efendim.';
        } else if (
          lower.includes('haber') || 
          lower.includes('gündem') || 
          lower.includes('radar') || 
          lower.includes('yalova') || 
          lower.includes('kocaeli') || 
          lower.includes('bursa') || 
          lower.includes('feribot') || 
          lower.includes('köprü') ||
          lower.includes('gelecek') ||
          lower.includes('haftalık')
        ) {
          actions.push({
            type: 'VIEW_REGIONAL_RADAR',
            target: 'regional_news',
            value: { timeHorizon: 'all' },
            details: 'Bölgesel Radar & Haberler modülü açıldı.'
          });
          speech = 'Efendim, tam konumunuz (Yalova/Altınova) ve çevre illerimiz (Kocaeli, Bursa, İstanbul) için hazırladığım canlı gündem, 1-3 günlük yakın gelecek uyarıları ve 7-8 günlük haftalık radar brifinginiz Bölgesel Radar ekranına yansıtıldı.';
        } else {
          speech = 'Emredersiniz efendim. J.A.R.V.I.S. hizmetinizde. Akıllı eviniz, ajandanız, notlarınız, bölgesel haber radarınız ve bilgisayarınız sürekli senkronize.';
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

  // J.A.R.V.I.S. Regional News & 1-3 / 7-8 Day Forecasting API
  app.post('/api/jarvis/regional-news', async (req, res) => {
    try {
      const { 
        city = 'Yalova', 
        district = 'Altınova', 
        nearbyCities = ['Kocaeli', 'Bursa', 'İstanbul'],
        timeHorizon = 'all'
      } = req.body;

      const client = getAI();

      if (client) {
        const prompt = `Kullanıcının tam konumu: ${city} ili, ${district || 'Merkez'} ilçesi.
Çevre İller: ${nearbyCities.join(', ')}.
İstenen Zaman Ufku: ${timeHorizon}.

Görevin: J.A.R.V.I.S. istihbarat ve haber sistemi olarak, kullanıcının bulunduğu il/ilçe ve çevre iller için güncel, gerçekçi ve yüksek doğrulukta bir "Bölgesel Gündem & Yakın Gelecek Radarı" veri paketi oluşturmaktır.

Aşağıdaki 3 zaman dilimini mutlaka kapsa:
1. "today" (Bugün / Canlı / Sıcak Gündem): Anlık ulaşım durumu (feribot, köprü, trafik), yerel sanayi/belediye gelişmeleri.
2. "1-3-days" (Yakın Gelecek / 1-3 Gün İçi): Fırtına/lodos deniz uyarıları, Osmangazi Köprüsü rüzgar tahminleri, İDO/BUDO feribot sefer bildirimleri, planlı SEDAŞ/BUSKİ elektrik/su altyapı bakım kesintileri, bölgesel toplantılar.
3. "7-8-days" (Haftalık Projeksiyon / 7-8 Gün İçi): Yaklaşan bölgesel hava dalgası/sıcaklık değişimi, bölgesel sanayi/tarım fuarları (örn: Altınova kivi/süs bitkileri, Bursa otomotiv, Kocaeli Bilişim Vadisi), belediyeler arası ulaşım koordinasyon planları.

Yalova ve Altınova bölgesinin coğrafi gerçeklerini göz önünde bulundur: Osmangazi Köprüsü, Topçular-Eskihisar feribot hattı, Altınova Tersaneler Bölgesi, Kocaeli (Karamürsel, Gebze, İzmit), Bursa (Orhangazi, Nilüfer, Osmangazi) ve İstanbul (Yenikapı, Pendik, Kadıköy) bağlantılarını yansıt.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver:
{
  "speechBriefing": "J.A.R.V.I.S. ses tonuyla (Efendim ile başlayan), hem ana konumu hem çevre illeri özetleyen, 1-3 ve 7-8 günlük önemli gelişmeleri ve fırtına/ulaşım uyarılarını içeren 2-3 cümlelik asistan sesli brifingi.",
  "news": [
    {
      "id": "string",
      "title": "Haber Başlığı",
      "summary": "Detaylı açıklama metni",
      "city": "${city} veya çevre ilden biri (Kocaeli, Bursa, İstanbul)",
      "district": "İlçe adı (örn: Altınova, Gebze, Nilüfer, Pendik)",
      "timeHorizon": "today" | "1-3-days" | "7-8-days",
      "timeHorizonLabel": "Bugün (Canlı)" | "1-3 Gün İçi (Beklenen)" | "7-8 Gün İçi (Haftalık)",
      "forecastDate": "string (örn: Bugün, 2 Gün Sonra, Gelecek Hafta Başı)",
      "category": "transport" | "weather_alert" | "infrastructure" | "civic_agenda" | "economy_events",
      "categoryLabel": "Ulaşım & Feribot" | "Hava & Güvenlik Uyarısı" | "Altyapı & Kesintiler" | "Yerel Gündem" | "Ekonomi & Sanayi",
      "severity": "critical" | "warning" | "info",
      "source": "Kaynak kurum (örn: AFAD Marmara, İDO, Meteoroloji Gn. Md., SEDAŞ, Valilik)",
      "impact": "Bölge halkına ve ulaşıma somut etkisi",
      "actionRecommendation": "Kullanıcıya önerilen aksiyon veya tedbir",
      "isNeighboringCity": boolean
    }
  ]
}`;

        try {
          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.6
            }
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.news && Array.isArray(parsed.news) && parsed.news.length > 0) {
            return res.json({ success: true, ...parsed });
          }
        } catch (aiErr: any) {
          console.warn('Gemini API demand spike, utilizing local radar cache:', aiErr?.message || aiErr);
        }
      }

      // Built-in intelligent fallback dataset
      return res.json({
        success: true,
        source: 'local_neural_cache',
        speechBriefing: `Efendim, tam konumunuz ${city} ${district ? `ve ${district}` : ''} ile çevre illerimiz (${nearbyCities.join(', ')}) için hazırladığım bölgesel radar brifinginiz hazır. 1 ila 3 gün içerisinde Marmara Denizi ve Osmangazi Köprüsü hattında beklenen rüzgar durumu ve feribot sefer saatleri güncellemeleri bulunmaktadır.`,
        news: [] // Client merges with full regional news dataset
      });
    } catch (err: any) {
      console.error('Regional news error:', err);
      res.status(200).json({ 
        success: true, 
        source: 'local_neural_cache',
        speechBriefing: 'Bölgesel radar telemetrisi yerel önbellekten aktarılıyor efendim.',
        news: [] 
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
