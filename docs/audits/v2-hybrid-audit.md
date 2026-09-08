# KeskinLab V2 Hibrit Yapı ve Uyum Denetimi

**Denetim tarihi:** 8 Eylül 2026  
**İncelenen branch:** `keskinlab-redesign-2026`  
**Yerel/remote V2 HEAD:** `80781359a3ea92bc54ed51f1d63758af7b64dfc0`  
**Remote `main` / production karşılaştırma SHA:** `b32bcea5fb506597f288ba6af36779313cd33e70`  
**V2 preview:** <https://v2-preview.keskinlab.com>  
**Production:** <https://www.keskinlab.com>

## A. KISA YÖNETİCİ ÖZETİ

V2 yayın adayı tek parça bir geçiş değildir. Ana sayfa onaylı `preview/homepage-v2.*` referansından, dört kanonik ders yüzeyi ise onaylı `preview/5-sinif-v3.*` çalışma alanından türetilmiştir. Bu iki çekirdek aile görsel ve işlevsel olarak büyük ölçüde sağlamdır. Buna karşılık Hakkında, İletişim, Evrak Çantası, Takvim ve özellikle Dijital Araçlar eski editoryal shell'i kullanmaya devam eder. Kullanıcı ders yüzeyinden bu sayfalara geçtiğinde logo, header, navigasyon, arama, mobil menü ve footer dili değişir; hibrit yapının en görünür kısmı budur.

Yayın açısından en önemli riskler şunlardır:

1. Yayın adayı ana sayfasının navigasyonu, bölüm sırası, hero eylemleri ve “Bu Hafta” kapsamı kilitli `homepage-architecture-v2.md` ile çelişir.
2. Ana sayfanın “Dijital İçerikler” girişleri gerçek KeskinLab materyal kataloğunu filtrelemek yerine MEB/YEĞİTEK Dijital Araçlar rehberindeki ankrajlara gider; bazı etiketler ile hedef içerik aynı işi ifade etmez.
3. Ana sayfa ve derslerin V2/V3 shell'i ile editoryal sayfaların legacy shell'i arasında belirgin gezinme ve kimlik kopması vardır.
4. 390 px gerçek Brave görüntüsünde ana sayfa header CTA'sı ve ders sayfası hafta şeridi/metni sağdan kesilir. `overflow-x: clip` taşmayı görünmez kılar; sorunu çözmez.
5. 5. sınıf Hafta 1'de “Derse Başla” ve “Slaytları Aç” aynı ayrı legacy ders oynatıcı yüzeyine gider; V3 materyal alanıyla iki arayüz ailesi yan yana kalır.
6. Footer'daki “Gizlilik” bağlantısı bir gizlilik belgesine değil Hakkında sayfasına gider.
7. İletişim sayfası gerçek bir iletişim kanalı sunmaz; bunu açıkça “hazırlanıyor” diye bildirir. Yanlış başarı iddiası yoktur ama yayın için ürün engelidir.

`npm run validate` kapsamındaki HTML, site, ders verisi, navigasyon, erişilebilirlik ve mirror kontrollerinin tümü geçti. Preview'daki 10 ana public yüzey, Hafta 1, PDF, DOCX ve legacy classroom yönlendirmesi gerçek HTTP ile `200` döndü. Bu nedenle sorun kırık bir build değil; bilgi mimarisi, ortak shell ve mobil yerleşim tutarlılığıdır.

**Yayın kararı:** Önemli uyumsuzluklar giderilmeden V2 olarak production'a alınmamalı. Mevcut production çalışır ve `main` değiştirilmemiştir; V2'nin çekirdek yatırımını yeniden yapmak gerekmiyor.

## B. SAYFA ENVANTERİ

| Public URL | Kanonik dosya | Tasarım durumu | Ana CSS / JS | Veri kaynağı | Uyum |
|---|---|---|---|---|---|
| `/` | `index.html` | V2 ana sayfa; onaylı görsel referansın yayın uyarlaması | `site-v2.css`, `site-materials.js`, `site-v2.js` | `site-materials.js`, `data/*.json` türevleri/JS içinde yükleme | Kısmi: görsel V2, mimari belgeyle sapmalar var |
| `/5-sinif-bty` | `5-sinif-bty.html` | V3 ders çalışma alanı | `course-v3.css`, `course-v3.js`, `site-materials.js` | `course-data-5-sinif.js`; kök kaynak `data/5-sinif.json` | Yüksek; Hafta 1 legacy giriş ve mobil kesilme hariç |
| `/6-sinif-bty` | `6-sinif-bty.html` | V3 ders çalışma alanı | aynı ortak V3 katmanı | `course-data-6-sinif.js`; `data/6-sinif.json` | Yüksek |
| `/robotik-kodlama` | `robotik-kodlama.html` | V3 ders çalışma alanı | aynı ortak V3 katmanı | `course-data-robotik.js`; `data/robotik.json` | Yüksek; ek materyal yokluğu dürüst boş durumla gösteriliyor |
| `/yapay-zeka` | `yapay-zeka.html` | V3 ders çalışma alanı | aynı ortak V3 katmanı | `course-data-yapay-zeka.js`; `data/yapay-zeka.json` | Yüksek; ek materyal yokluğu dürüst boş durumla gösteriliyor |
| `/dijital-araclar` | `dijital-araclar.html` | Bağımsız legacy/editoryal rehber; büyük inline CSS | Sayfa içi CSS, ortak uygulama JS'si yok | Sabit HTML, dış resmî bağlantılar | İşlevsel farklılık geçerli; ortak shell uyumu düşük |
| `/evrak-cantasi` | `evrak-cantasi.html` | Legacy editoryal shell | `keskinlab-typography.css`, `keskinlab-editorial.css` | Sabit HTML + gerçek XLSX/ders URL'leri | İçerik doğru, ortak shell uyumu düşük |
| `/takvim` | `takvim.html` | Legacy editoryal shell + sayfaya özel takvim CSS'si | ortak editoryal CSS + inline CSS | Sabit doğrulanmış 2026–2027 takvim içeriği | İşlevsel kompozisyon geçerli; ortak shell uyumu düşük |
| `/hakkinda` | `hakkinda.html` | Legacy editoryal shell | ortak tipografi/editoryal CSS | Sabit HTML | İçerik doğru, ortak shell uyumu düşük |
| `/iletisim` | `iletisim.html` | Legacy editoryal shell | ortak tipografi/editoryal CSS | Sabit HTML | Ortak shell uyumu düşük; gerçek kanal yok |
| `/5-sinif-hafta01` | `5-sinif-hafta01.html` | Eski özel ders oynatıcı/haftalık giriş | `hafta01-assets/hafta01.css/js`, ek legacy scriptler | Hafta 1'e özel sabit içerik ve materyal | Çalışıyor; V3 içinde paralel arayüz oluşturuyor |

Ek gerçek yüzeyler:

- `/classroom-*` dosyaları public canonical değildir. `_redirects` bunları temiz ders URL'lerine 301 taşır; dosyalar kanonik derslerle birebir uyumluluk aynasıdır.
- `preview/*`, `reader-prototype.*`, `hafta01-yeni-hiyerarsi-preview.html` ve `home-v2.html` production navigasyonunun public hedefleri değildir; prototip/uyumluluk varlıklarıdır.
- `brand/marka-kilavuzu.html` bir marka çalışma belgesidir; sitemap veya ana public gezinmede yer almaz.
- Ders içerik üretim standardı repo içinde `docs/content-contract.md` olarak bulundu. Bu belge kaynak klasörleri, dosya adları, 16:9 sunum standardı, gerçek materyal gösterimi, kanonik `data/*.json`, üretilmiş dosyalar ve doğrulama kapılarını tanımlar.

## C. DOĞRULANMIŞ UYUMSUZLUKLAR

### C-01 — Ana sayfa bilgi mimarisi kilitli belgeyle uyuşmuyor

- **Sayfa / URL:** `/`
- **Dosya / satır:** `index.html:23-30`, `index.html:138-234`; `docs/homepage-architecture-v2.md:7-25`, `29-42`, `80-100`
- **Mevcut durum:** Navigasyonda ayrıca “Ana Sayfa” ve “Dijital İçerikler” bulunuyor; “İçerikler ve Evraklar” yok. Bölüm sırası Hero → Hızlı Erişim → Dersler → Bu Hafta. “Bu Hafta” dört dersi gösteriyor.
- **Beklenen:** Logo ana sayfaya dönüş işlevini üstlenmeli; altı ana bağlantı içinde “İçerikler ve Evraklar” olmalı. Sıra Hero → Hızlı Erişim → Bu Hafta → Dersler olmalı. Bu Hafta yalnız 5. ve 6. sınıfı göstermeli.
- **Kanıt:** Browser DOM'unda nav etiketleri ve `.week-card` sayısı 4 doğrulandı. Kaynakta `site-v2.js:31-36,151,158` dört ders üzerinde map yapıyor.
- **Neden:** Onaylı görsel preview ile sonradan kilitlenen mimari belge birbirinden ayrışmış; yayın adayı görsel preview'ı esas almış.
- **Öneri:** Yeni tasarım üretmeden, mevcut V2 bileşenlerini mimari belgede tanımlanan sıralama/kapsamla hizalamak; önce belge–referans çatışmasını tek karar olarak kapatmak.
- **Öncelik:** Yüksek

### C-02 — Hero ve hızlı erişim eylemleri onaylı görev modelini karşılamıyor

- **Sayfa / URL:** `/`
- **Dosya / satır:** `index.html:62-68`, `96-135`; `docs/homepage-architecture-v2.md:49-78`
- **Mevcut durum:** Hero “5. Sınıfı Keşfet” ile “Tüm Dersleri Gör” sunuyor; eşdeğer 6. sınıf eylemi yok. Hızlı şerit beş giriş içeriyor ve “Bu Hafta” ayrı giriş olarak yok.
- **Beklenen:** Hero'da 5. ve 6. sınıfa eşdeğer erişim; hızlı alanda Bu Hafta, Ders Planları, Slaytlar, Etkinlikler, Evraklar ve Takvim olmak üzere altı görev girişi.
- **Kanıt:** 1440 ve 390 Brave ekran görüntüleri ile DOM bağlantıları doğrulandı.
- **Öneri:** Mevcut CTA bileşenini koruyup hedef/etiket setini kilitli mimariye göre düzeltmek.
- **Öncelik:** Yüksek

### C-03 — “Dijital İçerikler” bağlantıları gerçek materyal hedefi yerine rehbere gidiyor

- **Sayfa / URL:** `/#dijital-icerikler`
- **Dosya / satır:** `index.html:107-119`, `240-268`
- **Mevcut durum:** “Özgün Slaytlar”, “Etkinlikler”, “Sunular”, “Çalışma Kâğıtları”, “Testler”, “Görseller” ve “Şablonlar” bağlantıları `/dijital-araclar#ders-hazirla` veya `#d3` hedeflerine gidiyor. `data-material-filter` niteliği var fakat hedef sayfada bunu işleyen ortak JS bulunmuyor.
- **Beklenen:** Kullanıcı seçtiği gerçek KeskinLab materyal türüne veya içerik/evrak yüzeyine ulaşmalı; MEB araç rehberi ayrı ikincil giriş olmalı.
- **Kanıt:** Browser DOM hedefleri doğrulandı. Dijital Araçlar sayfasında yalnız inline CSS var, filtre JS'si yok; ilgili ankrajlar Yeni EBA/D3 açıklamasını açıyor.
- **Öneri:** Var olan materyal manifesti ve ders bağlamını kullanan gerçek hedefleri tanımlamak; hazır olmayan türleri göstermemek.
- **Öncelik:** Kritik

### C-04 — Ortak site shell'i üç farklı aileye ayrılmış

- **Sayfa / URL:** Dersler ile `/dijital-araclar`, `/evrak-cantasi`, `/takvim`, `/hakkinda`, `/iletisim` geçişleri
- **Dosya / seçici:** V2/V3 `.site-header`, `.main-nav`, `.header-actions`; editoryal `header`, `.links`, `#mobileNavToggle`, `.mobile-drawer`; `evrak-cantasi.html:23-40`, `hakkinda.html:23-40`
- **Mevcut durum:** Ana sayfa/derslerde yazı logolu V2 header, arama, Derse Başla ve JS dialog menü var. Editoryal sayfalarda devre karakterli logo, farklı link seti, CSS checkbox drawer, aramasız ve farklı footer var. Dijital Araçlar ayrıca kendi sayfa içi CSS'siyle üçüncü varyant.
- **Beklenen:** Sayfa kompozisyonu değişebilir; marka, ortak header/nav, arama erişimi ve footer grameri sayfalar arasında kopmamalı.
- **Kanıt:** 1280 DOM taramasında V2/V3 `headerClass=site-header`, search=true; beş editoryal yüzeyde boş header class ve search=false. 1440/390 ekran görüntüleri görsel kopuşu doğruladı.
- **Öneri:** İçerik gövdelerini ve işlevsel yerleşimleri koruyup yalnız ortak shell sözleşmesini birleştirmek.
- **Öncelik:** Yüksek

### C-05 — 390 px'de header ve ders içeriği sağdan kesiliyor

- **Sayfa / URL:** `/`, `/5-sinif-bty` (aynı V3 shell'i kullanan dört ders için ortak risk)
- **Dosya / seçici:** `site-v2.css:754-780` `.header-actions .btn-primary`; `course-v3.css:478-506` `html, body`, `.week-selector`, `.week-topic`
- **Mevcut durum:** 390×844 gerçek Brave görüntüsünde ana header'daki “Derse Başla” CTA'sının sağ tarafı görünüm dışına taşıyor. Ders sayfasında hafta durum pill'i ve uzun konu başlığı/metni sağdan kesiliyor. `html, body { overflow-x: clip; }` nedeniyle kullanıcı yatay kaydırarak da içeriğe ulaşamıyor.
- **Beklenen:** Mobil hiyerarşi doğal yeniden akmalı; CTA, hafta meta bilgileri ve metin tam okunmalı.
- **Kanıt:** `/private/tmp/keskinlab-audit/preview-home-390.png` ve `preview-course-390.png` gerçek tarayıcı çıktıları. 1280 DOM kontrolünde taşma yoktu; sorun mobil breakpoint'e özgü.
- **Öneri:** Yeni kompozisyon üretmeden header eylemlerini mobil önceliğe göre sığdırmak; hafta seçiciyi ve metin kutularını gerçek wrap/min-width davranışıyla düzeltmek; `clip` ile maskelememek.
- **Öncelik:** Kritik

### C-06 — 5. sınıf Hafta 1 iki ders arayüzüne ayrılıyor

- **Sayfa / URL:** `/5-sinif-bty?week=1` → `/5-sinif-hafta01`
- **Dosya / satır:** `course-data-5-sinif.js` içindeki `links.week1Lesson`; `course-v3.js:260-266,524`; `scripts/promote-v2-surfaces.mjs:4,100`
- **Mevcut durum:** V3 yüzeyinde materyal önizleme ve dosyalar zaten mevcutken “Derse Başla” ve “Slaytları Aç” aynı legacy Hafta 1 oynatıcısını açıyor. Diğer ders/haftalarda günlük plan veya materyal doğrudan kullanılıyor.
- **Beklenen:** Aynı görev için anlaşılır tek ana akış; özel ders oyuncusu korunacaksa rolü ve dönüş yolu V3 çalışma alanıyla açıkça ilişkili olmalı.
- **Kanıt:** Browser AX ağacında iki eylemin de `/5-sinif-hafta01.html` hedefi doğrulandı; URL HTTP `200`.
- **Öneri:** Legacy oyuncuyu otomatik silmeden, ürün kararıyla ya V3 içinde açık “sınıf sunumu” rolüne indirgemek ya da V3 materyal görüntüleyicisini tek giriş yapmak.
- **Öncelik:** Orta

### C-07 — Footer “Gizlilik” yanlış semantik hedefe gidiyor

- **Sayfa / URL:** `/` footer
- **Dosya / satır:** `index.html:330-334`
- **Mevcut durum:** “Gizlilik” bağlantısı `/hakkinda` hedefini kullanıyor.
- **Beklenen:** Gerçek bir gizlilik belgesine gitmesi veya böyle bir belge yoksa kullanıcıya ayrı bir yasal yüzey varmış izlenimi vermemesi.
- **Kanıt:** Kaynak ve gerçek browser DOM'u aynı hedefi gösterdi.
- **Öneri:** Yasal içerik kararı verildikten sonra doğru hedef oluşturmak; karar öncesinde yanıltıcı etiketi kaldırma seçeneğini değerlendirmek.
- **Öncelik:** Orta

### C-08 — İletişim public yüzeyi gerçek kanal sağlamıyor

- **Sayfa / URL:** `/iletisim`
- **Dosya / içerik:** `iletisim.html`, “İLETİŞİM KANALI HAZIRLANIYOR” ve “Doğrudan iletişim yakında” bölümleri
- **Mevcut durum:** Hata/öneri için yönlendirme anlatılıyor ancak e-posta, form veya başka kalıcı kanal yok.
- **Beklenen:** Ana navigasyon/footer'da public iletişim hedefi varsa kullanıcı eylemi tamamlayabilmeli.
- **Kanıt:** Gerçek browser AX ağacında tek sonraki bağlantı Hakkında sayfasına gidiyor; iletişim kontrolü yok.
- **Öneri:** Yayın öncesi güvenli tek kanal belirlemek. Bu içerik tasarım hatası değil, tamamlanmamış ürün işlevidir.
- **Öncelik:** Yüksek

### C-09 — README ile kilitli V2 belgeleri birbirleriyle çelişiyor

- **Dosya / satır:** `README.md:31-45`; `docs/design-system-v2.md:25-51`; `docs/homepage-architecture-v2.md:80-100`
- **Mevcut durum:** README, Bu Hafta'da dört ders der; mimari belge yalnız 5/6 der. README site-wide tipografiyi Space Grotesk + Inter olarak tanımlar; Design System V2 IBM Plex Sans'ı ana aile olarak kilitler.
- **Beklenen:** Üretim ve denetim için tek kaynak önceliği; uygulamanın hangi belgenin kararını izlediği belirsiz olmamalı.
- **Kanıt:** V2/V3 gerçekte IBM Plex Sans kullanıyor; editoryal katman Space Grotesk/Inter kullanıyor. Uygulama iki belgenin farklı bölümlerini yansıtıyor.
- **Öneri:** Kod değiştirmeden önce belge önceliğini netleştirip README'yi güncel kararlara göre hizalamak.
- **Öncelik:** Yüksek

### C-10 — Üretim scripti onaylı preview'ı doğrudan production kaynağına bağlıyor

- **Dosya / satır:** `scripts/promote-v2-surfaces.mjs:13-28,47-110`
- **Mevcut durum:** `index.html`, `site-v2.css/js`, ders HTML/JS/CSS ve `course-data-*.js` preview dosyalarından mekanik olarak üretiliyor. Preview'daki bilgi mimarisi veya yanlış footer hedefi böylece production adayına aynen taşınıyor.
- **Beklenen:** Onaylı görsel referans korunurken production URL/veri sözleşmeleri ve kilitli bilgi mimarisi deterministik şekilde uygulanmalı; manuel düzeltme generator tarafından geri alınmamalı.
- **Kanıt:** Diff, ana sayfa ile preview arasında esas olarak path dönüşümleri olduğunu; V3 CSS/JS'nin referansla aynı olduğunu gösterdi.
- **Öneri:** Sonraki revizyonda düzeltmeleri çıktıya değil generator/reference kaynaklarına uygulamak ve validator'a mimari sözleşme kontrolleri eklemek.
- **Öncelik:** Orta

## D. ESKİ SİTEDEN KALAN PARÇALAR

### Bilinçli uyumluluk için gerekli

- `classroom-*.html`: Kanonik ders dosyalarının birebir aynaları. `_redirects` legacy URL'leri temiz canonical ders URL'lerine taşırken build eşitlik kontrolü bunları güvenli tutuyor.
- `_redirects` içindeki `/home-v2`, `/index.html` ve `/classroom-*` kuralları: eski bağlantıların kullanıcıyı doğru yeni yüzeye ulaştırması için gerekli.
- `keskinlab-editorial.css` ve `keskinlab-typography.css`: Hakkında, İletişim, Evrak Çantası ve Takvim'in mevcut çalışan gövdelerini taşıyor; ortak shell birleşmeden kaldırılamaz.
- `5-sinif-hafta01.html` ve `hafta01-assets/*`: mevcut özel Hafta 1 ders deneyimi; V3 ile rolü netleşene kadar otomatik silinmemeli.

### Hâlâ aktif fakat hibrit görünümü oluşturan

- Editoryal sayfalardaki `.links`, checkbox tabanlı `#mobileNavToggle` ve `.mobile-drawer` header sistemi.
- Dijital Araçlar'ın büyük inline CSS ve bağımsız header/footer yapısı.
- Editoryal sayfalardaki devre karakterli görsel logo; V2/V3'ün yazı logolu shell'inden farklı.
- Space Grotesk/Inter tipografi katmanı; V2/V3'ün IBM Plex Sans sisteminden farklı.

### Kullanım kanıtı bulunmayan temizlik adayları

- `home-v2.html`, `home-v2.css`, `home-v2-release.css`, `home-v2.js` (production `main` ailesinin kaynakları; V2 branch'te canonical `/` artık bunları kullanmıyor).
- `classroom-v2.css/js`, `classroom-v2-base.css`, `classroom-v1-experience.js`, `classroom-viewer-enhancements.js`, `classroom-week01-web-content.js`.
- `reader-prototype.html/css/js`, `hafta01-yeni-hiyerarsi-preview.html`, `preview/lesson-player-v1*.html`.
- `robotik-data-1.js`, `robotik-data-2.js`, `yapay-zeka-data-1.js`, `yapay-zeka-data-2.js` gibi eski veri paketleri; kanonik V3 yüzeyleri `course-data-*.js` kullanıyor.

Bu adayların hiçbiri bu denetimde silinmedi. Silme kararı öncesinde doğrudan URL trafiği, dış bağlantılar, build script referansları ve rollback ihtiyacı ayrıca doğrulanmalıdır.

## E. İÇERİK VE VERİ UYUMU

### Doğru ve korunması gereken veri sözleşmesi

- `docs/content-contract.md` sonradan oluşturulan ders içerik üretim standardıdır ve değiştirilmedi.
- Kanonik veri `data/5-sinif.json`, `data/6-sinif.json`, `data/robotik.json`, `data/yapay-zeka.json` içindedir.
- Build türevleri `generated/courses.json`, `generated/materials.json`, `generated/web/` olup kaynak kabul edilmez.
- Günlük plan sayıları 37/37/36/36 sözleşmesiyle ve iki basamaklı hafta adıyla doğrulanıyor.
- Materyal manifesti yalnız gerçekten var olan dosyaları taşır. PDF ve DOCX örnekleri preview'da doğru MIME ile HTTP `200` döndü.
- Robotik/Yapay Zekâ Hafta 1'de ek materyal olmadığında sahte kart gösterilmiyor; “ek materyal henüz yüklenmedi, günlük plan hazır” şeklindeki açık boş durum veri sözleşmesiyle uyumlu.

### Uyuşmazlıklar ve riskler

- Ana sayfa materyal türü etiketleri, gerçek manifest araması yerine Dijital Araçlar rehber ankrajlarına bağlıdır (C-03).
- 5. sınıf Hafta 1'in ayrı oyuncu istisnası `promote-v2-surfaces.mjs` içinde elle tanımlıdır; yeni içerik üretim standardının genel akışından ayrılır (C-06).
- V3'te diğer derslerin öğrenci açıklaması, 5. sınıftaki küratörlü `studentCopy` kadar zengin değildir; örneğin 6. sınıf açıklaması doğrudan öğrenme çıktısının “Bu hafta...” biçimidir. Bu doğruluk hatası değildir fakat içerik üretim kalitesi eşit değildir.
- Seçmeli derslerin tema başlığında `RK.1.1.` / `YZU.1.1.` kodları korunuyor. README kodların öğretmen/müfredat katmanında kullanılabileceğini söylediği için bu tek başına hata sayılmadı; ana konu başlıklarında kodlar gösterilmiyor.

## F. NAVİGASYON VE URL UYUMU

### Doğru çalışanlar

- Temiz ders URL'leri kanoniktir ve HTTP `200` döner.
- `/classroom-5-sinif.html` gerçek istekte `/5-sinif-bty` hedefine yönlendi ve sonuç `200` oldu; diğer alias kuralları aynı yapıda.
- `/home-v2`, `/home-v2.html`, `/index.html` köke yönlendirilir.
- Ders araması açılıyor; odak `#searchInput` alanına geliyor.
- Hafta ileri gezinmesi URL'yi `?week=2` yapıp konu başlığını doğru yeniliyor.
- Öğretmen katmanı açılıyor ve Günlük Ders Planı, Yıllık Plan, Evrak Çantası ve Eğitim Takvimi bağlantılarını gösteriyor.

### Düzeltilmesi gerekenler

- Ortak nav etiketleri üç ailede farklıdır: V2 ana sayfa, V3 dersler ve legacy editoryal shell aynı global bilgi mimarisini sunmuyor.
- Editoryal mobil drawer hâlâ production/main anasayfasının eski `/#bugun` ve `/#zaman` ankrajlarına gider. V2 adayında bu id'ler yoktur (`#bu-hafta` vardır); kullanıcı köke gider fakat hedef bağlamına inmez.
- Ana sayfa footer “Gizlilik” → `/hakkinda` eşlemesi yanlıştır.
- Materyal filtre nitelikleri hedef sayfada çalıştırılmadığından etiket/hedef uyumsuzluğu vardır.
- `.html?week=n` ve temiz `?week=n` yolları Cloudflare'da çalışsa da kullanıcıya açık link üretiminde iki biçim kullanılıyor; canonical temiz URL standardı tekleştirilmeli.

## G. KORUNMASI GEREKENLER

- Onaylı homepage V2'nin sakin renk, IBM Plex Sans, hero görseli, kart/ayırıcı dengesi ve 1440 masaüstü hiyerarşisi.
- Dört dersin tek `course-v3.css/js` ailesi, ortak HTML iskeleti ve kursa özel `course-data-*.js` ayrımı.
- V3 hafta seçimi, URL state'i, arama dialogu, focus aktarımı, öğretmen katmanı ve gerçek materyal önizleme/dosya ayrımı.
- Kanonik `data/*.json` → generator → doğrulanan türevler veri hattı.
- Hazır olmayan materyali sahte kartla göstermeyen boş durum.
- PDF aç/indir ve DOCX günlük plan bağlantılarının gerçek dosyalara gitmesi.
- Takvim, Evrak Çantası ve Dijital Araçlar'ın işleve uygun farklı içerik kompozisyonları. Bunların ders sayfasına benzemesi gerekmiyor; yalnız ortak shell hizalanmalı.
- Legacy classroom redirect ve mirror guard'ları.
- `npm run validate` kalite kapıları; bunlar mevcut kırık bağlantı/veri regressions'larını iyi engelliyor.

## H. ÖNERİLEN REVİZYON SIRASI

1. **Kaynak kararını tekleştir:** README, Design System V2, Homepage Architecture V2 ve onaylı preview arasındaki iki açık çatışmayı (Bu Hafta kapsamı ve tipografi) ürün kararıyla kapat. Koddan önce yapılmalı; aksi hâlde aynı hibritlik yeniden üretilir.
2. **Ortak shell sözleşmesi:** V2/V3 header, global nav, arama, mobil menü ve footer'ı tek davranış sözleşmesine bağla. Editoryal sayfaların gövde kompozisyonunu koru.
3. **Kritik mobil düzeltmeler:** 390 px header ve V3 hafta alanındaki kesilmeyi gider; 390, 720/768, 1080 ve 1440 regresyon kontrolleri ekle.
4. **Ana sayfa görev mimarisi:** Bölüm sırası, hero 5/6 eylemleri, hızlı erişim seti ve Bu Hafta kapsamını seçilen kilitli karara göre hizala.
5. **Materyal yönlendirmesi:** Dijital içerik etiketlerini gerçek manifest/ders materyali hedeflerine bağla; Dijital Araçlar'ı ayrı rehber olarak koru.
6. **Ders girişini tekleştir:** 5. sınıf Hafta 1 legacy oyuncusunun V3 içindeki rolünü belirle ve çift CTA anlamını düzelt.
7. **Editoryal yüzeyler:** Ortak shell'i Hakkında, İletişim, Evrak Çantası, Takvim ve son olarak kapsamı en geniş olan Dijital Araçlar'a uygula. Sayfa içeriğini yeniden tasarlama.
8. **Yasal/ürün tamamlamaları:** Gerçek İletişim kanalı ve Gizlilik hedefi kararlarını tamamla.
9. **Temizlik ayrı paket:** Kullanılmayan prototip/legacy adaylarını ancak trafik ve build bağımlılığı incelemesinden sonra ayrı, geri alınabilir değişiklik olarak ele al.
10. **Yeni kalite kapıları:** Mimari bölüm sırası/kapsamı, nav hedefleri, yanlış ankrajlar ve 390 px görsel taşma için otomatik kontroller ekle; mevcut veri/link validator'larını koru.

## I. YAYIN KARARI

**Karar: Önemli uyumsuzluklar giderilmeden V2 olarak yayınlanmamalı.**

Gerekçe, estetik tercih değil, doğrulanmış ürün ve erişim sorunlarıdır: gerçek materyal olmayan hedeflere giden içerik CTA'ları (C-03), 390 px'de kesilen temel header/ders içeriği (C-05), kilitli bilgi mimarisiyle doğrudan çelişen ana sayfa (C-01/C-02), global shell kopması (C-04) ve tamamlanmamış iletişim kanalı (C-08). Bunlar giderildiğinde çekirdek homepage V2 ve course V3 yatırımı korunarak yayın yapılabilir.

### Doğrulama özeti

- Git çalışma ağacı denetim başında temizdi; yerel ve remote V2 HEAD aynıydı.
- Remote `main` ayrı SHA'da kaldı; bu denetimde commit, push, merge veya deploy yapılmadı.
- Preview 10 public yüzeyde gerçek browser DOM'u ile açıldı; kırık görsel görülmedi ve 1280 görünümde yatay taşma saptanmadı.
- Preview ana sayfa, V3 ders ve editoryal yüzeyler gerçek Brave ile 1440×1000 ve 390×844 görüntülendi. Mobil kesilme C-05 olarak kaydedildi.
- Production ana sayfa aynı gerçek motorla 1440×1000 ve 390×844 karşılaştırıldı; production hâlâ eski `home-v2.css/js` ailesidir.
- Arama, hafta ilerletme ve öğretmen paneli gerçek tarayıcıda çalıştı.
- Ana public URL'ler, Hafta 1, örnek PDF/DOCX ve legacy classroom yönlendirmesi gerçek HTTP ile `200` verdi.
- `npm run validate`: 23 HTML dosyası, 10 public navigasyon yüzeyi, 10 erişilebilirlik yüzeyi ve 4 course mirror çifti dahil tüm kontroller geçti.

### Denetim sınırı

Ekran görüntüleri yalnız geçici denetim kanıtı olarak `/private/tmp/keskinlab-audit/` altında üretildi; repository'ye eklenmedi. Dış MEB/YEĞİTEK bağlantılarının güncelliği bu turda tek tek yeniden taranmadı; repo bunları haftalık `Check Official Links` işiyle izliyor. Hiçbir tasarım, içerik, uygulama kodu, branch veya deployment değiştirilmedi.

## J. UYGULAMA SONRASI DURUM

Bu denetimin ardından aynı branch üzerinde uygulanan düzeltmelerle durum güncellenmiştir:

- **C-01 / C-02:** Son kullanıcı onayı üstün kabul edilerek dört dersli “Bu Hafta” ve mevcut V2 bölüm kompozisyonu korundu. Masaüstü menüsündeki gereksiz “Ana Sayfa” tekrarı kaldırıldı; çelişen mimari dokümantasyon güncellendi.
- **C-03:** Ana sayfadaki materyal türleri gerçek `/materyaller/` dosyalarına güvenli fallback verir ve JS açıkken mevcut manifest kayıtlarını filtreleyen aramayı açar. Dijital Araçlar rehberi ayrı kaldı.
- **C-04 / C-09:** Beş editoryal yüzey ortak V2 marka, global navigasyon, arama, mobil menü, footer ve IBM Plex tipografi katmanına geçirildi; sayfa gövdeleri korunmuştur.
- **C-05:** Mobil header ve V3 hafta alanında grid/flex küçülme, wrap ve `min-width` kuralları düzeltildi; yatay taşmayı `overflow-x: clip` ile maskeleyen kural kaldırıldı.
- **C-06:** Hafta 1 sınıf sunumu korunarak eylemler “Sınıf Sunumunu Başlat” ve V3 içi “Materyalleri Gör” olarak ayrıldı; viewer dönüşü seçili Hafta 1 çalışma alanına bağlandı.
- **C-07:** Onaylı gizlilik metni bulunmadığı için yanıltıcı “Gizlilik → Hakkında” bağlantısı kaldırıldı; yasal metin uydurulmadı.
- **C-08:** Repo içinde onaylı gerçek iletişim kanalı bulunmadığından kanal eklenmedi. Bu, kalan tek açık ürün kararıdır.
- **C-10:** Düzeltmeler preview kaynaklarına ve `scripts/promote-v2-surfaces.mjs` generator'ına işlendi. İki ardışık generator çalıştırması aynı checksum'ları üretti; hedefli navigasyon/materyal/shell/mobil regresyon kontrolleri eklendi.
