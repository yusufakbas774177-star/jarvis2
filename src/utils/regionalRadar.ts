import { RegionalNewsItem, UserLocationDetails, TimeHorizon, NewsCategory } from '../types';

// Turkey Province & Regional Neighbors Geographic Mapping
export const PROVINCE_NEIGHBORS: Record<string, string[]> = {
  'Yalova': ['Kocaeli', 'Bursa', 'İstanbul'],
  'Kocaeli': ['Yalova', 'İstanbul', 'Sakarya', 'Bursa'],
  'Bursa': ['Yalova', 'Kocaeli', 'Balıkesir', 'Bilecik', 'İstanbul'],
  'İstanbul': ['Kocaeli', 'Tekirdağ', 'Yalova', 'Bursa'],
  'Sakarya': ['Kocaeli', 'Düzce', 'Bolu', 'Bilecik'],
  'Balıkesir': ['Bursa', 'Çanakkale', 'İzmir', 'Manisa', 'Kütahya'],
  'Tekirdağ': ['İstanbul', 'Edirne', 'Kırklareli', 'Çanakkale'],
  'Bilecik': ['Bursa', 'Kocaeli', 'Sakarya', 'Bolu', 'Eskişehir', 'Kütahya'],
  'Çanakkale': ['Balıkesir', 'Tekirdağ', 'Edirne'],
  'Ankara': ['Eskişehir', 'Konya', 'Kırıkkale', 'Çankırı', 'Bolu', 'Aksaray'],
  'İzmir': ['Manisa', 'Aydın', 'Balıkesir'],
  'Antalya': ['Muğla', 'Burdur', 'Isparta', 'Konya', 'Mersin'],
  'Eskişehir': ['Ankara', 'Bilecik', 'Kütahya', 'Afyonkarahisar', 'Konya'],
  'Adana': ['Mersin', 'Hatay', 'Osmaniye', 'Kahramanmaraş', 'Kayseri', 'Niğde'],
  'Konya': ['Ankara', 'Aksaray', 'Niğde', 'Karaman', 'Antalya', 'Isparta', 'Afyonkarahisar'],
  'Samsun': ['Ordu', 'Amasya', 'Tokat', 'Çorum', 'Sinop'],
  'Trabzon': ['Rize', 'Giresun', 'Gümüşhane'],
  'Gaziantep': ['Kilis', 'Şanlıurfa', 'Adıyaman', 'Kahramanmaraş', 'Osmaniye', 'Hatay'],
  'Diyarbakır': ['Şanlıurfa', 'Mardin', 'Batman', 'Muş', 'Bingöl', 'Elazığ', 'Malatya'],
};

// Turkish city name normalizer
export function normalizeCityName(cityName: string): string {
  if (!cityName) return 'Yalova';
  const clean = cityName.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('yalova')) return 'Yalova';
  if (lower.includes('kocaeli') || lower.includes('izmit') || lower.includes('i̇zmit')) return 'Kocaeli';
  if (lower.includes('bursa')) return 'Bursa';
  if (lower.includes('istanbul') || lower.includes('i̇stanbul')) return 'İstanbul';
  if (lower.includes('ankara')) return 'Ankara';
  if (lower.includes('izmir') || lower.includes('i̇zmir')) return 'İzmir';
  if (lower.includes('sakarya') || lower.includes('adapazarı')) return 'Sakarya';
  if (lower.includes('balikesir') || lower.includes('balıkesir')) return 'Balıkesir';
  if (lower.includes('antalya')) return 'Antalya';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function getNearbyProvinces(cityName: string, district?: string): string[] {
  const norm = normalizeCityName(cityName);
  if (PROVINCE_NEIGHBORS[norm]) {
    return PROVINCE_NEIGHBORS[norm];
  }
  // Default regional hub if unmapped
  return ['İstanbul', 'Kocaeli', 'Bursa'];
}

// Initial Comprehensive Regional News Dataset (specifically tuned to Yalova / Altınova and neighbors Kocaeli, Bursa, İstanbul)
export const INITIAL_REGIONAL_NEWS: RegionalNewsItem[] = [
  // --- BUGÜN (CANLI & SICAK GÜNDEM) ---
  {
    id: 'news_live_1',
    title: 'Topçular - Eskihisar Feribot Hattında Yoğunluk ve Sefer Aralığı',
    summary: 'Yalova Altınova ve Topçular İskelesi çıkışında hafta içi sevkiyat araçları nedeniyle 20 dakikalık araç kuyruğu gözlemleniyor. İDO ve Negmar sefer aralıklarını 10 dakikaya indirdi.',
    city: 'Yalova',
    district: 'Altınova / Topçular',
    timeHorizon: 'today',
    timeHorizonLabel: 'Bugün (Canlı)',
    forecastDate: 'Bugün, Güncel',
    category: 'transport',
    categoryLabel: 'Ulaşım & Feribot',
    severity: 'warning',
    source: 'Yalova Liman Başkanlığı & İDO',
    impact: 'Kocaeli ve İstanbul yönüne geçecek sürücülerin Osmangazi Köprüsü veya hızlı feribot alternatiflerini değerlendirmesi önerilir.',
    actionRecommendation: 'Osmangazi Köprüsü geçişi akıcı seyrediyor, alternatif olarak köprü güzergahı önerilir.',
    isNeighboringCity: false
  },
  {
    id: 'news_live_2',
    title: 'Kocaeli Körfez Geçişi ve D-130 Karayolunda Akıcı Trafik',
    summary: 'Yalova-Karamürsel-Gölcük-İzmit aksında D-130 karayolunda trafik açık. Karamürsel sahil yolunda asfalt temizlik ekipleri kontrollü tek şerit çalışması yürütüyor.',
    city: 'Kocaeli',
    district: 'Karamürsel - Gölcük',
    timeHorizon: 'today',
    timeHorizonLabel: 'Bugün (Canlı)',
    forecastDate: 'Bugün, Güncel',
    category: 'transport',
    categoryLabel: 'Ulaşım & Feribot',
    severity: 'info',
    source: 'Kocaeli Ulaşım Koordinasyon Merkezi (UKOME)',
    impact: 'Bölgesel işe gidiş-dönüş akışında aksama beklenmiyor.',
    isNeighboringCity: true
  },
  {
    id: 'news_live_3',
    title: 'Altınova Tersaneler Bölgesi Gemi Bakım ve İndirme Operasyonu',
    summary: 'Altınova Tersane Girişimcileri bölgesinde 145 metrelik kimyasal tanker suya indirme manevrası gerçekleştirildi. Sahil Güvenlik deniz trafiğini kontrollü olarak yönlendiriyor.',
    city: 'Yalova',
    district: 'Altınova Tersaneler',
    timeHorizon: 'today',
    timeHorizonLabel: 'Bugün (Canlı)',
    forecastDate: 'Bugün, Güncel',
    category: 'economy_events',
    categoryLabel: 'Ekonomi & Sanayi',
    severity: 'info',
    source: 'Altınova Tersane Girişimcileri A.Ş.',
    impact: 'Tersaneler Caddesi üzerinde ağır tonajlı taşıt girişleri kontrollü sağlanıyor.',
    isNeighboringCity: false
  },
  {
    id: 'news_live_4',
    title: 'İstanbul Deniz Otobüsleri (İDO) Kadıköy - Yenikapı - Armutlu Seferleri',
    summary: 'Yenikapı-Yalova ve Kadıköy-Yalova deniz otobüsü seferleri tam zamanında gerçekleştiriliyor. Marmara Denizi dalga yüksekliği 0.6 metre seviyesinde stabil.',
    city: 'İstanbul',
    district: 'Yenikapı / Kadıköy',
    timeHorizon: 'today',
    timeHorizonLabel: 'Bugün (Canlı)',
    forecastDate: 'Bugün, Güncel',
    category: 'transport',
    categoryLabel: 'Ulaşım & Feribot',
    severity: 'info',
    source: 'İDO Sefer Hareket Merkezi',
    impact: 'Deniz ulaşımında herhangi bir aksama yoktur.',
    isNeighboringCity: true
  },

  // --- 1-3 GÜN (YAKIN GELECEK & BEKLENEN GELİŞMELER) ---
  {
    id: 'news_future_1',
    title: 'Osmangazi Köprüsü ve Marmara Güneyi: 1-3 Gün İçi Lodos & Fırtına Uyarısı',
    summary: 'Meteoroloji 1. Bölge ve AFAD Marmara verilerine göre; 48-72 saat içerisinde Marmara Denizi ve İzmit Körfezi genelinde güneybatıdan (Lodos) 55-70 km/s hızında fırtına bekleniyor.',
    city: 'Yalova',
    district: 'Altınova / Osmangazi Köprüsü',
    timeHorizon: '1-3-days',
    timeHorizonLabel: '1-3 Gün İçi (Beklenen)',
    forecastDate: '48-72 Saat İçinde',
    category: 'weather_alert',
    categoryLabel: 'Hava & Güvenlik Uyarısı',
    severity: 'critical',
    source: 'Meteoroloji Genel Müdürlüğü & AFAD Marmara',
    impact: 'Hızlı feribot ve deniz otobüsü seferlerinde kısmi iptaller yaşanabilir; Osmangazi Köprüsü\'nde yüksek araçlar için hız tahdidi uygulanabilir.',
    actionRecommendation: '1-3 gün sonraki deniz ve köprü yolculuklarınızı sabah saatlerine planlamanız veya hava durumunu teyit etmeniz tavsiye edilir.',
    isNeighboringCity: false
  },
  {
    id: 'news_future_2',
    title: 'SEDAŞ: Altınova ve Çiftlikköy Hatlarında Planlı Şebeke Modernizasyonu',
    summary: 'Sakarya Elektrik Dağıtım A.Ş. (SEDAŞ), 2 gün sonra Yalova Altınova sanayi ve konut hatlarında trafo yenileme çalışması nedeniyle sabah 09:00 - 13:00 saatleri arasında planlı kesinti uygulayacak.',
    city: 'Yalova',
    district: 'Altınova & Çiftlikköy',
    timeHorizon: '1-3-days',
    timeHorizonLabel: '1-3 Gün İçi (Beklenen)',
    forecastDate: '2 Gün Sonra (09:00 - 13:00)',
    category: 'infrastructure',
    categoryLabel: 'Altyapı & Kesinti',
    severity: 'warning',
    source: 'SEDAŞ Dağıtım Şebeke Planlama',
    impact: 'Hassas elektronik cihazların aşırı gerilim koruyuculara bağlanması önerilir.',
    actionRecommendation: 'J.A.R.V.I.S. sistemleriniz kesintisiz güç kaynağı (UPS) devrelerine bağlı olduğundan asistan çalışmaya devam edecektir.',
    isNeighboringCity: false
  },
  {
    id: 'news_future_3',
    title: 'Bursa BUSKİ Nilüfer & Osmangazi İçme Suyu Arıtma Hattı Düzenlemesi',
    summary: 'Bursa Su ve Kanalizasyon İdaresi (BUSKİ), Doğancı ve Nilüfer Barajı ana isale hattında vana değişimi gerçekleştirecek. Osmangazi ilçesi üst kesimlerinde su basıncında düşüş bekleniyor.',
    city: 'Bursa',
    district: 'Osmangazi / Nilüfer',
    timeHorizon: '1-3-days',
    timeHorizonLabel: '1-3 Gün İçi (Beklenen)',
    forecastDate: 'Yarından Sonra (1-2 Gün)',
    category: 'infrastructure',
    categoryLabel: 'Altyapı & Kesinti',
    severity: 'info',
    source: 'BUSKİ Genel Müdürlüğü',
    impact: 'Bursa yönünde bulunan kullanıcılarımız için su deposu kontrolleri tavsiye edilir.',
    isNeighboringCity: true
  },
  {
    id: 'news_future_4',
    title: 'Kocaeli Bilişim Vadisi Gebze: Marmara Ar-Ge ve Girişimcilik Buluşması',
    summary: 'Gebze Muallimköy Bilişim Vadisi Yerleşkesi\'nde 3 gün sonra otonom mobilite ve yapay zeka teknolojileri paneli düzenlenecek. Bölge sanayicileri ve teknoloji firmaları katılım sağlayacak.',
    city: 'Kocaeli',
    district: 'Gebze (Bilişim Vadisi)',
    timeHorizon: '1-3-days',
    timeHorizonLabel: '1-3 Gün İçi (Beklenen)',
    forecastDate: '3 Gün Sonra',
    category: 'economy_events',
    categoryLabel: 'Ekonomi & Teknoloji',
    severity: 'info',
    source: 'Bilişim Vadisi Genel Müdürlüğü',
    impact: 'Osmangazi Köprüsü Gebze çıkışı Bilişim Vadisi kavşağında sabah saatlerinde katılımcı yoğunluğu olabilir.',
    isNeighboringCity: true
  },

  // --- 7-8 GÜN (HAFTALIK PROJEKSİYON & GELECEK GÜNDEM) ---
  {
    id: 'news_weekly_1',
    title: 'Marmara Havzası Genelinde 7-8 Gün Sonra Sıcaklık Düşüşü ve Yağış Dalgası',
    summary: 'Balkanlar üzerinden gelmesi öngörülen serin ve yağışlı hava kütlesi 7-8 gün içerisinde Yalova, İstanbul, Kocaeli ve Bursa genelinde hava sıcaklıklarını 6-8 derece düşürecek.',
    city: 'Yalova',
    district: 'Marmara Bölgesi Geneli',
    timeHorizon: '7-8-days',
    timeHorizonLabel: '7-8 Gün İçi (Haftalık)',
    forecastDate: '7-8 Gün Sonra (Önümüzdeki Hafta Başı)',
    category: 'weather_alert',
    categoryLabel: 'Hava & Güvenlik Uyarısı',
    severity: 'info',
    source: 'Avrupa Orta Vadeli Hava Tahminleri (ECMWF) & MGM',
    impact: 'Tarım arazilerinde ve Yalova süs bitkileri seralarında koruma önlemleri alınmalıdır.',
    actionRecommendation: 'Önümüzdeki hafta yapılacak açık hava seyahatlerinde yağmurluk ve kışlık giysiler hazır bulundurulmalıdır.',
    isNeighboringCity: false
  },
  {
    id: 'news_weekly_2',
    title: 'Yalova Süs Bitkileri ve Kivi Üreticileri İhracat & Hasat Hazırlığı',
    summary: 'Türkiye süs bitkisi üretiminin öncüsü olan Yalova Altınova ve Çınarcık vadilerinde sonbahar budama ve kivi hasat sezonu hazırlık toplantısı gerçekleştirilecek.',
    city: 'Yalova',
    district: 'Altınova & Çınarcık',
    timeHorizon: '7-8-days',
    timeHorizonLabel: '7-8 Gün İçi (Haftalık)',
    forecastDate: 'Önümüzdeki Hafta (7-8 Gün)',
    category: 'economy_events',
    categoryLabel: 'Ekonomi & Tarım',
    severity: 'info',
    source: 'Yalova Tarım ve Orman İl Müdürlüğü',
    impact: 'Yerel üreticiler için sulama birlikleri ve soğuk hava depoları kapasite artışına gidiyor.',
    isNeighboringCity: false
  },
  {
    id: 'news_weekly_3',
    title: 'Bursa Tüyap Fuar Merkezi: Uluslararası Otomotiv ve Yan Sanayi Zirvesi',
    summary: 'Gelecek hafta sonuna doğru Bursa Tüyap Fuar ve Kongre Merkezi\'nde elektrikli araç bataryaları ve kompozit yedek parça üreticileri fuarı kapılarını açacak.',
    city: 'Bursa',
    district: 'Nilüfer / Tüyap',
    timeHorizon: '7-8-days',
    timeHorizonLabel: '7-8 Gün İçi (Haftalık)',
    forecastDate: 'Önümüzdeki Hafta Cuma (8 Gün)',
    category: 'civic_agenda',
    categoryLabel: 'Yerel Gündem & Fuar',
    severity: 'info',
    source: 'Bursa Ticaret ve Sanayi Odası (BTSO)',
    impact: 'Yalova ve Kocaeli üzerinden Bursa yönüne otoyol trafiğinde fuar ziyaretçileri nedeniyle artış bekleniyor.',
    isNeighboringCity: true
  },
  {
    id: 'news_weekly_4',
    title: 'İstanbul - Kocaeli - Yalova Deniz Ulaşımı Kış Tarifesi Koordinasyon Kurulu',
    summary: 'Marmara Denizi kıyısındaki büyükşehir ve il belediyeleri kış dönemi ortak vapur ve deniz otobüsü tarifelerini belirlemek üzere İstanbul Büyükşehir Belediyesi koordinasyonunda toplanacak.',
    city: 'İstanbul',
    district: 'Marmara Belediyeler Birliği',
    timeHorizon: '7-8-days',
    timeHorizonLabel: '7-8 Gün İçi (Haftalık)',
    forecastDate: 'Gelecek Hafta İçi (7 Gün)',
    category: 'transport',
    categoryLabel: 'Ulaşım & Feribot',
    severity: 'info',
    source: 'Marmara Belediyeler Birliği (MBB)',
    impact: 'Kış döneminde sefer saatleri revize edilecek ve yeni hat önerileri karara bağlanacak.',
    isNeighboringCity: true
  }
];

// Generates an articulate J.A.R.V.I.S. voice briefing
export function generateVoiceBriefing(news: RegionalNewsItem[], location: UserLocationDetails): string {
  const city = location.city || 'Yalova';
  const district = location.district ? ` ve ${location.district} ilçesi` : '';
  const neighborsStr = location.nearbyCities.slice(0, 3).join(', ');

  const criticalItems = news.filter((n) => n.severity === 'critical' || n.category === 'weather_alert');
  const transportItems = news.filter((n) => n.category === 'transport');
  const futureItems = news.filter((n) => n.timeHorizon === '1-3-days' || n.timeHorizon === '7-8-days');

  let briefing = `Efendim, tam konumunuz ${city}${district} ve çevre illerimiz ${neighborsStr} için hazırladığım bölgesel radar brifinginiz hazır. `;

  if (criticalItems.length > 0) {
    briefing += `Öncelikle kritik bir uyarımız var: ${criticalItems[0].title}. ${criticalItems[0].summary} `;
  }

  if (transportItems.length > 0) {
    briefing += `Ulaşım koridorlarında: ${transportItems[0].title}. `;
  }

  if (futureItems.length > 0) {
    briefing += `Önümüzdeki bir ila üç gün ile yedi ila sekiz gün içerisindeki projeksiyonlarımızda: ${futureItems[0].title} ve ${futureItems[futureItems.length - 1]?.title || 'önemli gelişmeler'} beklenmektedir. `;
  }

  briefing += `Tüm bölgesel veriler ve detaylar ekranınızdaki Bölgesel Radar panelinde canlı olarak güncellenmektedir efendim.`;

  return briefing;
}
