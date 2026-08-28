# KeskinLab içerik ve materyal sözleşmesi

Bu belge Release A ile birlikte kilitlenen kaynak dosya standardıdır. Amaç, yeni haftaların istisna üretmeden aynı klasör ve format sözleşmesiyle yayımlanmasıdır.

## 1. Ders ve hafta kimliği

Materyal kökü:

```text
materyaller/
  5-sinif/
  6-sinif/
  robotik/
  yapay-zeka/
```

Hafta klasörü her zaman iki basamaklıdır:

```text
hafta01 ... hafta37
```

`hafta1`, `Hafta01`, `week01` gibi varyantlar kaynak materyal ağacında geçersizdir.

## 2. Hafta klasörü

Bir hafta yalnızca gerçekten mevcut bileşenleri içerir. Boş klasör oluşturulmaz.

```text
hafta01/
  sunum/
  ders-notu/
  ogrenci-etkinligi/
  infografik/
  hafta-ozeti/
  olcme-degerlendirme/
    kisa-cevap/
    rubrik/
    kontrol-listesi/
  ogretmen/
    gozlem-formu/
```

Bilinen klasör sözlüğü dışındaki bir ad validator tarafından hata kabul edilir. Böylece `ogrenci-etknligi` gibi yazım hataları sessizce kaybolmaz.

## 3. Kaynak dosya adları

Kaynak dosyalar klasör içinde konumsal ad taşır:

```text
01.png
02.png
01.pdf
01.docx
```

Numara iki basamaklıdır. Ders/hafta bilgisi dosya adında tekrar edilmez; bu bilgi klasör yolundan gelir.

Kullanıcı indirirken generator anlamlı `download` adı üretir:

```text
KeskinLab-5-Sinif-Hafta-01-Ders-Notu.pdf
KeskinLab-6-Sinif-Hafta-01-Ogrenci-Etkinligi.pdf
```

## 4. PDF / DOCX format varyantı

PDF ve DOCX aynı materyalin format varyantlarıdır; ayrı materyal satırı sayılmaz.

Kurallar:

1. Aynı klasörde aynı gövde adına sahip `01.pdf` ve `01.docx` tek materyal kaydıdır.
2. PDF varsa sayfa içi görüntüleme için birincil formattır.
3. DOCX varsa aynı kartta **Düzenlenebilir dosya** olarak ikinci indirme seçeneğidir.
4. Yalnız PDF varsa materyal görüntülenir ve PDF indirilebilir.
5. Yalnız DOCX varsa kart görüntülenir; sayfa içi önizleme yapılmaz, **Düzenlenebilir dosyayı indir** sunulur.
6. Desteklenen hiçbir dosya yoksa bileşen görünmez.
7. Generator formatı tahmin etmez; yalnızca bu eşleme kuralını uygular.

## 5. Görsel kaynak standardı

Git'e ham, şişkin export commit edilmez. Kaynak görsel de optimize edilmiş master olmalıdır.

- Tercih edilen kaynak: PNG/JPEG (içeriğin doğasına göre).
- Hedef kaynak boyutu: **600 KiB veya altı**.
- 1.2 MiB üzeri raster kaynak validator'da uyarı üretir.
- `--strict-assets` modunda 1.2 MiB üzeri raster kaynak build hatasıdır.
- **Dosya boyutunu düşürmek için piksel boyutu küçültülmez.** Önce palet/quantization, metadata temizliği ve doğru PNG/JPEG kodlaması uygulanır; kaynak masterın genişlik/yüksekliği korunur.
- Mevcut Hafta 01 görselleri optimize edilirken piksel boyutlarının birebir aynı kaldığı script tarafından doğrulanır.
- Yeni **sunum** görselleri 16:9 oranında ve en az **1920×1080** üretilir. Eski 1672×941 slaytlar migrasyonda büyütülmez; yalnızca kodlamaları optimize edilir.
- İnfografikler ve hafta özetleri kendi tasarım oranında kalır; 1920×1080 kuralı bunlara uygulanmaz.
- Baskı/indirilebilir kalite gerekiyorsa mümkün olduğunda PDF ayrıca saklanır; web görüntüsü için gereksiz büyük PNG tutulmaz.
- Build aşamasında web türevleri (WebP ve thumbnail) kaynaktan üretilir.

Mevcut Hafta 1 rasterları A2.0 içinde optimize edilir; A2.1 motor merge'inden önce strict asset kontrolü temiz geçmelidir.

## 6. Thumbnail kuralı

`thumbs/` **kaynak sözleşmesinin parçası değildir** ve kaynak ağacında bulunamaz.

Thumbnail build çıktısıdır. Elle oluşturulan/eski `thumbs/` klasörleri yeni yapıya taşınmaz.

## 7. Materyal bulunmayan hafta

Materyal yokluğu, hafta yokluğu anlamına gelmez. Müfredat verisi ve günlük plan mevcut olabilir.

Classroom motorunun ileride uygulayacağı durum:

- önce mevcut hafta bilgisi ve günlük plan,
- ardından varsa sınıf materyalleri,
- materyal yoksa sessiz bir bilgi notu.

Materyal yokluğu sayfanın ana başlığı veya hata durumu değildir.

## 8. Özel hafta

Sınav, okul temelli planlama veya sosyal etkinlik gibi haftalar materyalsiz normal haftadan ayrıdır. `konu`, `tema` ve öğrenme çıktısı boş olabilirse de hafta geçerlidir.

Motor katmanı bu haftaları **özel hafta** durumu olarak göstermeli; boş başlık üretmemelidir. Kurban Bayramı çakışması gibi takvim işaretleri veri kaybına uğratılmadan ayrıca korunur.

## 9. Günlük planlar

Her ders için hafta başına bir günlük plan bulunmalıdır:

- 5. sınıf BTY: 37
- 6. sınıf BTY: 37
- Robotik Kodlama-I: 36
- Yapay Zekâ Uygulamaları-I: 36

Kaynak dosya adı iki basamaklı hafta standardını kullanır:

```text
gunluk-planlar-5sinif/hafta01-5sinif-bty.docx
gunluk-planlar-6sinif/hafta01-6sinif-bty.docx
gunluk-planlar-robotik/hafta01-robotik-kodlama.docx
gunluk-planlar-yapay-zeka/hafta01-yapay-zeka-uygulamalari.docx
```

Kullanıcıya sunulan indirme adı insan okunur olur, örneğin:

```text
KeskinLab-5-Sinif-Hafta-01-Gunluk-Plan.docx
```

Validator yalnızca klasörde 37/36 dosya bulunmasını değil, Homepage ve Classroom tarafından çalışma anında üretilen bütün günlük-plan yollarının diskte gerçekten var olduğunu da doğrular.

## 10. Legacy veri taşıyıcıları — geçici A2.0 kuralı

`5-sinif-bty.html` ve `6-sinif-bty.html` kullanıcı yüzeyi olarak emekliye ayrılmıştır; içlerindeki eski materyal linkleri A2.0 link taramasından açıkça hariç tutulur.

Buna rağmen A2.1'e kadar `classroom-v2.js` bu dosyalardaki `const WEEKS` bloklarını RAW GitHub üzerinden veri kaynağı olarak kullanır. Bu nedenle validator her iki dosyadaki veri bloğunun parse edilebildiğini ve **37 kayıt** döndürdüğünü ayrıca kontrol eder. RAW bağımlılığı A2.1'de kalkınca bu geçici guard kaldırılır.

## 11. Üretilen dosyalar

Generator çıktıları kaynak değildir ve elle düzenlenmez:

```text
generated/
  materials.json
  web/
```

`generated/web/` altında WebP önizlemeler ve thumbnail'lar build sırasında üretilir. Daha sonraki motor merge'inde aynı üretici yerel ders verisi ve arama indeksini de üretecektir.
