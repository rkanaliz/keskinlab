# KeskinLab

KeskinLab; 5–6. sınıf Bilişim Teknolojileri ve Yazılım, Robotik Kodlama-I ve Yapay Zekâ Uygulamaları-I için haftalık ders akışı, günlük planlar, sınıf materyalleri ve öğretmen araçlarını tek yapıda birleştiren statik eğitim projesidir.

## Yayın mimarisi
- Kaynak: GitHub (`main` production)
- Hosting / deploy: Cloudflare Pages
- Alan adı: `www.keskinlab.com`
- Mimari: statik HTML / CSS / JavaScript
- Production anasayfa: `index.html` → `/`
- Kanonik ders verisi: `data/*.json`
- Build çıktıları: `generated/courses.json`, `generated/materials.json`, `generated/web/`

## Ana yüzeyler
- `index.html` — yaşayan anasayfa / Bu Hafta / zaman çizgisi / dersler
- `hakkinda.html` — KeskinLab nedir?
- `iletisim.html` — hata, öneri, geri bildirim ve iş birliği yüzeyi
- `dijital-araclar.html` — öğretmen için MEB ve YEĞİTEK dijital araçlar rehberi
- `classroom-5-sinif.html`, `classroom-6-sinif.html` — BTY sınıf yüzeyleri
- `classroom-robotik.html`, `classroom-yapay-zeka.html` — seçmeli ders sınıf yüzeyleri
- `evrak-cantasi.html`, `takvim.html` — öğretmen araçları
- `search-index.js`, `command-palette.js` — ortak arama

## Günlük planlar
- `gunluk-planlar-5sinif/` — 37 hafta
- `gunluk-planlar-6sinif/` — 37 hafta
- `gunluk-planlar-robotik/` — 36 hafta
- `gunluk-planlar-yapay-zeka/` — 36 hafta

## Kilitli arayüz kararları
- Ana sayfadaki **Bu Hafta** kartlarında dört ders aynı bilgi gramerini kullanır: **ders adı → okunabilir konu başlığı → tema**.
- Robotik Kodlama-I ve Yapay Zekâ Uygulamaları-I için `RK.1.1.1`, `1.1`, `1.2`, `1.1.1` gibi müfredat kodları ana konu başlığında gösterilmez. Kodlar veri katmanında korunur; Müfredat / Classroom / öğretmen katmanında kullanılabilir.
- Robotik ve Yapay Zekâ kartlarında tipografi, punto, satır aralığı, renk, hizalama, öğretmen katmanı, **Derse Başla** ve **Günlük Plan** yapısı 5. ve 6. sınıf kartlarıyla aynı kalır. Sadece konu metni okunabilir hâle getirilir.
- Hazır olmayan materyal veya evrak, kullanıcı yüzeyinde sahte kart/placeholder olarak gösterilmez.
- Dijital Araçlar sayfası bağımsız editoryal rehber kimliğini korur; ana site shell’iyle yarışacak görsel süs eklenmez.

## Site-wide tipografi ve editoryal kabuk
- Ortak tipografi katmanı: `keskinlab-typography.css`
- Ortak editoryal sayfa kabuğu: `keskinlab-editorial.css`
- Space Grotesk: başlıklar ve editoryal vurgu
- Inter: gövde metni ve navigasyon
- IBM Plex Mono: numara, tarih, etiket, metadata ve teknik bilgi
- Başlık ağırlığı varsayılan olarak 700'dür; sentetik 650/800 ağırlık kullanılmaz.
- Hakkında, İletişim ve Evrak Çantası ortak editoryal kabuk üzerinden aynı navigasyon ve tipografi gramerini kullanır.

## Kalite kapıları
Production build aşağıdaki kontroller temiz geçmeden başarılı sayılmaz:
- HTML yerel bağlantıları
- materyal klasör sözleşmesi ve strict asset sınırları
- günlük plan bütünlüğü
- ders verisi bütünlüğü
- global navigasyon mimarisi (`scripts/validate-navigation.mjs`)
- temel erişilebilirlik korumaları (`scripts/validate-accessibility.mjs`)

MEB/YEĞİTEK gibi resmî dış kaynak bağlantıları `Check Official Links` GitHub Actions işiyle haftalık kontrol edilir. Kesin `404/410` durumları hata, geçici ağ/sunucu sorunları uyarı olarak değerlendirilir.

## SEO ve yayın hijyeni
- `robots.txt` ve `sitemap.xml` production kökünde tutulur.
- `_headers` temel güvenlik başlıklarını uygular.
- Kamuya açık ana yüzeylerde canonical URL kullanılır; derslerin temiz URL standardı ayrıca routing katmanında korunur.

## Çalışma standardı
Tasarım ve özellik denemeleri mümkün olduğunda preview üzerinde yapılır. Production'a alınan her değişiklik GitHub Actions doğrulamasından geçer; çalışan sistemi gereksiz yere yeniden yazmak yerine ortak katmanlar kademeli olarak konsolide edilir.
