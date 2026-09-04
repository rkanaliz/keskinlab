# KeskinLab Homepage Architecture V2

Bu belge, yeni KeskinLab ana sayfasının onaylanmış ve kilitlenmiş bilgi mimarisini tanımlar. Görsel uygulama kararlarında `docs/design-system-v2.md` geçerlidir.

## 1. Nihai navigasyon

KeskinLab logosu ana sayfaya yönlendirir. Navigasyonda ayrıca “Ana Sayfa” bağlantısı bulunmaz.

Masaüstü ana navigasyonu:

1. **5. Sınıf** — 5. Sınıf Bilişim Teknolojileri ve Yazılım ders alanına doğrudan erişim sağlar.
2. **6. Sınıf** — 6. Sınıf Bilişim Teknolojileri ve Yazılım ders alanına doğrudan erişim sağlar.
3. **Seçmeli Dersler** — Robotik Kodlama ve Yapay Zekâ Uygulamaları derslerini tek başlık altında toplar.
4. **İçerikler ve Evraklar** — slayt, etkinlik, günlük ders planı ve yıllık plan gibi öğretmen kaynaklarına erişim sağlar.
5. **Takvim** — eğitim haftaları, tatiller ve belirli günlere ulaşır.
6. **Hakkında** — KeskinLab’ın amacı ve çalışma yaklaşımını açıklar.

Arama, navigasyon bağlantısı değildir; ayrı bir kontrol olarak sağ tarafta yer alır.

**Dijital Araçlar** ana navigasyonda bulunmaz. Bu alana:

- İçerikler ve Evraklar bölümündeki ikincil girişten,
- footer bağlantısından

erişilir.

Navigasyon basit kalır; mega menü veya çok katmanlı kategori sistemi kullanılmaz.

## 2. Nihai bölüm sırası

Ana sayfanın yukarıdan aşağı bölüm sırası:

01. **Hero**
02. **Hızlı Erişim**
03. **Bu Hafta**
04. **Dersler**
05. **İçerikler ve Evraklar**
06. **Takvim Özeti**
07. **Kısa Proje Notu + Footer**

“Bu Hafta” bölümü masaüstünde ve mobilde genel ders kataloğundan önce gelir. Öğretmenin en acil ihtiyacı, mevcut eğitim haftasındaki 5. ve 6. sınıf dersine ulaşmaktır.

## 3. Her bölümün amacı

### 01. Hero

**Kullanıcı ihtiyacı:** KeskinLab’ın ne olduğunu ve öncelikli derslere nasıl ulaşacağını ilk bakışta anlamak.

**Gösterilecek içerik:**

- kısa ve güçlü bir ana başlık,
- KeskinLab’ın öğretim programını sınıfta uygulanabilir haftalık ders deneyimlerine dönüştüren bir öğretmen çalışma alanı olduğunu anlatan tek kısa açıklama,
- 5. ve 6. sınıfa doğrudan erişim,
- tek ve anlamlı eğitim görseli.

**Ana eylemler:**

- 5. Sınıfı Keşfet
- 6. Sınıfı Keşfet

Bu iki yol eşdeğer olduğu için aynı görsel ağırlıkta sunulabilir. Hero uzun pazarlama metni, istatistik veya sosyal kanıt içermez.

### 02. Hızlı Erişim

**Kullanıcı ihtiyacı:** Site kategorilerini öğrenmeden yapılan işe göre doğru alana gitmek.

**Gösterilecek girişler:**

- Bu Hafta
- Ders Planları
- Slaytlar
- Etkinlikler
- Evraklar
- Takvim

Bu alan ana navigasyonun tekrarı değildir. Girişler kullanıcı görevlerine göre adlandırılır ve onaylı ana sayfa referansındaki hafif yatay erişim şeridi yaklaşımını izler. Altı ayrı ağır karta dönüştürülmez.

**Ana eylem:** Seçilen iş alanına doğrudan gitmek.

### 03. Bu Hafta

**Kullanıcı ihtiyacı:** İçinde bulunulan eğitim haftasının dersini hızla hazırlamak veya açmak.

**Kapsam yalnızca:**

- 5. Sınıf Bilişim Teknolojileri ve Yazılım,
- 6. Sınıf Bilişim Teknolojileri ve Yazılım.

Robotik Kodlama ve Yapay Zekâ Uygulamaları bu bölümde gösterilmez. Bu derslerin haftalık akışı kendi ders sayfalarında yer alır.

**Gösterilecek içerik:**

- eğitim haftası numarası,
- tarih aralığı,
- 5. sınıf konusu ve tema bilgisi,
- 6. sınıf konusu ve tema bilgisi,
- gerçekten mevcut olan haftalık içerik ve ders planı eylemleri,
- tatil, dönem öncesi, hafta sonu veya dönem sonu gibi güncel takvim durumu.

**Ana eylem:** Her sınıf için doğrudan ilgili haftaya gitmek; hazır ders yüzeyi varsa “Derse Başla” eylemini göstermek.

Dönem başlamadan mevcut olmayan bir eğitim haftası üretilmez. İlk haftaya kalan süre ve hazırlık durumu gösterilir. Tatil döneminde tatil bilgisi ile dönüş haftasına erişim birlikte verilebilir.

Hafta ve ders bilgileri repo içindeki türetilmiş uygulama verisinden okunur; resmî öğretim programı, yıllık plan ve çalışma takvimiyle çelişen veri ana sayfada resmî bilgi gibi sunulamaz.

### 04. Dersler

**Kullanıcı ihtiyacı:** Tüm ders alanlarını görmek ve seçilen dersin genel akışına girmek.

**Gösterilecek dersler:**

- 5. Sınıf Bilişim Teknolojileri ve Yazılım
- 6. Sınıf Bilişim Teknolojileri ve Yazılım
- Robotik Kodlama
- Yapay Zekâ Uygulamaları

5. ve 6. sınıf BTY, ana ve öncelikli ders alanlarıdır. Robotik Kodlama ile Yapay Zekâ Uygulamaları ikincil düzeyde gösterilir. Dört ders, eşit ağırlıklı ticari ürün kartları gibi düzenlenmez.

**Ana eylem:** İlgili ders alanını açmak.

### 05. İçerikler ve Evraklar

**Kullanıcı ihtiyacı:** Aranan kaynağa dosya türü veya öğretmen görevi üzerinden ulaşmak.

**Ana girişler:**

- Sunumlar
- Etkinlikler ve Çalışma Kâğıtları
- Günlük Ders Planları
- Yıllık Planlar

Ölçme ve değerlendirme materyalleri, gerçekten mevcut oldukları ilgili ders veya hafta bağlamında gösterilir. Ana sayfada tüm dosyalar listelenmez.

**İkincil giriş:**

- Dijital Araçlar — mevcut MEB ve YEĞİTEK dijital araçlar rehberine yönlendirir.

**Ana eylem:** Seçilen içerik veya evrak grubunu görmek.

Hazır olmayan kaynaklar için boş kart, sahte bağlantı veya “yakında” bileşeni oluşturulmaz.

### 06. Takvim Özeti

**Kullanıcı ihtiyacı:** Bugünün eğitim yılındaki yerini ve sıradaki önemli tarihi hızla görmek.

**Gösterilecek içerik en fazla üç bilgiyle sınırlandırılır:**

- bugünkü eğitim durumu,
- mevcut eğitim haftası,
- sıradaki tatil veya ders akışını etkileyen en yakın tarih.

Yaklaşan belirli gün veya hafta ders bağlamı açısından anlamlıysa bu kısa özet içinde yer alabilir. Ana sayfada tam takvim gösterilmez.

**Ana eylem:** Tüm Takvimi Gör.

Takvim verisi, resmî 2026–2027 çalışma takvimiyle doğrulanmış uygulama verisinden gelmelidir.

### 07. Kısa Proje Notu + Footer

**Kullanıcı ihtiyacı:** Platformun amacını kısa biçimde anlamak ve ikincil bağlantılara ulaşmak.

**Gösterilecek içerik:**

- KeskinLab’ın öğretim programını sınıfta uygulanabilir ders akışına dönüştürdüğünü anlatan kısa proje notu,
- Hakkında,
- İletişim,
- Dijital Araçlar,
- gerekli kaynak ve yasal bağlantılar.

Proje notu iki veya üç kısa cümleyi geçmez. Ana sayfanın sonu uzun bir “biz kimiz” metnine dönüşmez.

## 4. Masaüstü hiyerarşisi

İlk görünümde logo, altı ana navigasyon bağlantısı, arama kontrolü ve hero yer alır. Hero’nun sol tarafı mesaj ve 5–6. sınıf eylemlerini; sağ tarafı tek eğitim görselini taşır.

Hero altında hafif yatay Hızlı Erişim şeridi bulunur. Ardından öğretmenin acil görevine öncelik verilerek Bu Hafta bölümü gelir. Burada 5. ve 6. sınıf haftalık dersleri birlikte ve kolay karşılaştırılabilir biçimde gösterilir.

Dersler bölümü daha sonra genel katalog görevini üstlenir. 5. ve 6. sınıf BTY görsel olarak baskın, seçmeli dersler ikincil düzeydedir. Sayfanın devamında İçerikler ve Evraklar ile Takvim Özeti yer alır; kısa proje notu ve footer sayfayı tamamlar.

Sayfanın okuma mantığı:

1. KeskinLab nedir?
2. Şimdi ne yapmak istiyorum?
3. Bu hafta hangi ders var?
4. Diğer ders alanları nerede?
5. Materyal ve evraklara nasıl ulaşırım?
6. Takvimde sırada ne var?
7. Projenin kapsamı ve ikincil bağlantılar nelerdir?

## 5. Mobil hiyerarşisi

Mobil bölüm sırası masaüstüyle aynıdır:

01. Hero  
02. Hızlı Erişim  
03. Bu Hafta  
04. Dersler  
05. İçerikler ve Evraklar  
06. Takvim Özeti  
07. Kısa Proje Notu + Footer

Masaüstü navigasyonu dar alana sıkıştırılmaz; mobil hiyerarşi yeniden düzenlenir. Logo ana sayfaya dönüş işlevini korur. Arama erişilebilir fakat ana içeriğin önüne geçmeyen ayrı bir kontrol olarak kalır.

Hero içinde sıralama:

1. kısa bağlam,
2. ana başlık,
3. açıklama,
4. 5. sınıf eylemi,
5. 6. sınıf eylemi,
6. eğitim görseli.

Hızlı Erişim, altı ağır kart yerine hafif bağlantı satırları veya doğal yeniden akış kullanan kompakt bir yüzeydir.

Bu Hafta bölümünde önce 5. sınıf, ardından 6. sınıf gösterilir. Konu ve ana eylem önce; tema, tarih ve ikincil dosya seçenekleri sonra gelir.

Dersler bölümünde 5. ve 6. sınıf BTY önce gösterilir. Robotik Kodlama ve Yapay Zekâ Uygulamaları aynı görsel ağırlığa çıkarılmaz.

Minimum dokunma hedefi Design System V2’de tanımlanan `44 × 44 px` ölçüsünü korur.

## 6. Ana sayfada bulunmayacak içerikler

- Navigasyonda ayrıca “Ana Sayfa” bağlantısı
- Ana navigasyonda Dijital Araçlar bağlantısı
- Robotik Kodlama ve Yapay Zekâ Uygulamalarının Bu Hafta kayıtları
- Tüm haftaların listesi
- Tüm materyal ve dosyaların listesi
- Öğrenme çıktıları ile süreç bileşenlerinin uzun metinleri
- Tam eğitim takvimi
- Uzun yıllık zaman çizgisi
- Uzun duyuru veya haber akışı
- Uzun “biz kimiz” anlatısı
- Dört dersi eşit ticari ürün kartları gibi gösteren düzen
- Altı Hızlı Erişim öğesini ağır kartlara dönüştüren düzen
- Hazır olmayan materyaller için placeholder veya “yakında” kartları
- Gerçekte bulunmayan indirme bağlantıları
- Dekoratif istatistik, sayaç veya doğrulanmamış sosyal kanıt
- Kullanıcı hesabı, giriş veya kişisel dashboard
- Gamification bileşenleri
- SaaS pazarlama blokları
- Gerçek kullanıcı görevini açıklamayan teknik metafor bölümleri
- Aynı hedefe yönlenen tekrarlı baskın CTA’lar
