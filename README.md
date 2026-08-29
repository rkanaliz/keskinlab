# KeskinLab

KeskinLab; 5–6. sınıf Bilişim Teknolojileri ve Yazılım, Robotik Kodlama-I ve Yapay Zekâ Uygulamaları-I için haftalık ders akışı, günlük planlar, sınıf materyalleri ve öğretmen araçlarını tek yapıda birleştiren statik eğitim projesidir.

## Yayın mimarisi
- Kaynak: GitHub (`main` production)
- Hosting / deploy: Cloudflare Pages
- Alan adı: `www.keskinlab.com`
- Mimari: statik HTML / CSS / JavaScript
- Production anasayfa: `index.html` → `/`
- Geliştirme: ayrı branch → preview → kontrol → `main`

## Ana yüzeyler
- `index.html` — yaşayan anasayfa / Bu Hafta / zaman çizgisi / dersler
- `hakkinda.html` — KeskinLab nedir? + iletişim
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
- 5. Sınıf Hafta 01 **Ders Notu** ve **Öğrenci Etkinliği**, 6. sınıftaki gibi ortak PDF/DOCX viewer akışını kullanır; özel web-içerik override'ı kullanılmaz.

## Çalışma standardı
Tasarım ve özellik denemeleri önce preview üzerinde yapılır. Onaylanan değişiklikler paket halinde `main` dalına alınır; production üzerinde doğrudan deneme yapılmaz.
