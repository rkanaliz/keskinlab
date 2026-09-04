# KeskinLab Design System V2

Bu belge, yeni KeskinLab arayüzünün onaylanmış ve kilitlenmiş tasarım sistemini tanımlar.

## 1. Tasarım karakteri

KeskinLab arayüzü:

- modern,
- editoryal,
- ferah,
- sakin,
- öğretmen dostu,
- ortaokul öğrencisine yabancı gelmeyen,
- teknolojik fakat tech-startup görünmeyen

bir eğitim platformu karakteri taşımalıdır.

Arayüz nötr ve düzenli kalmalı; renk, oyun ve eğlence esas olarak ders materyallerinde yaşamalıdır. Görsel hiyerarşi geniş boşluklar, güçlü fakat bağırmayan başlıklar ve ince ayırıcılarla kurulmalıdır.

## 2. Renk sistemi

| Token | Değer |
| --- | --- |
| `--color-bg` | `#FCFBFA` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-subtle` | `#F6F5F3` |
| `--color-surface-warm` | `#F2EEE8` |
| `--color-text` | `#181A1F` |
| `--color-text-secondary` | `#5F646D` |
| `--color-text-muted` | `#858A92` |
| `--color-accent` | `#8B1E24` |
| `--color-accent-hover` | `#74181D` |
| `--color-accent-active` | `#5F1318` |
| `--color-accent-soft` | `#F4E9EA` |
| `--color-accent-border` | `#D4AAAD` |
| `--color-border` | `#DEDCD8` |
| `--color-border-strong` | `#B9B8B5` |
| `--color-focus` | `#8B1E24` |
| `--color-on-accent` | `#FFFFFF` |

Bordo kontrollü vurgu rengidir. Parlak kırmızıya dönüşmemeli ve geniş yüzeylerde baskınlaştırılmamalıdır.

Mavi ve yeşil ana arayüz kimliği olarak kullanılmayacaktır. Genel görünüm hafif sıcak olabilir ancak bej veya krem eğitim sitesi hissine yaklaşmamalıdır.

## 3. Tipografi

Ana yazı ailesi **IBM Plex Sans**’tır. Ana başlıklar, gövde metni, navigasyon ve butonlarda kullanılır.

Teknik mikro bilgi ailesi **IBM Plex Mono**’dur. Yalnızca şu alanlarda kullanılabilir:

- hafta,
- süre,
- öğrenme çıktısı kodu,
- dosya türü,
- kısa teknik etiket.

Örnekler: `HAFTA 01`, `40 + 40 DK`, `BTY.5.1.1`, `PDF`, `DOCX`, `SUNUM`.

IBM Plex Mono büyük başlıklarda veya paragraf gövdesinde kullanılmayacaktır.

| Stil | Boyut | Satır yüksekliği | Ağırlık |
| --- | ---: | ---: | ---: |
| Display | 64 px | 1.02 | 600 |
| H1 | 48 px | 1.08 | 600 |
| H2 | 34 px | 1.15 | 600 |
| H3 | 24 px | 1.25 | 600 |
| Body Large | 19 px | 1.55 | 400 |
| Body | 16 px | 1.55 | 400 |
| Body Small | 14 px | 1.45 | 400 |
| Label | 13 px | 1.30 | 600 |
| Meta | 12 px | 1.35 | 500 |

Ana başlıkların ritmi güçlü olmalı fakat afiş gibi bağırmamalıdır.

## 4. Boşluk sistemi

Temel boşluk ölçeği:

| Token | Değer |
| --- | ---: |
| `--space-1` | 4 px |
| `--space-2` | 8 px |
| `--space-3` | 12 px |
| `--space-4` | 16 px |
| `--space-5` | 24 px |
| `--space-6` | 32 px |
| `--space-7` | 48 px |
| `--space-8` | 64 px |
| `--space-9` | 96 px |
| `--space-10` | 128 px |

Ana içerik maksimum genişliği `1200 px` olmalıdır.

## 5. Border ve radius

Temel border kalınlığı `1 px`’tir.

| Token | Değer |
| --- | ---: |
| `--radius-xs` | 4 px |
| `--radius-sm` | 8 px |
| `--radius-md` | 12 px |
| `--radius-lg` | 16 px |
| `--radius-pill` | 999 px |

`999 px` yalnızca gerçek durum veya pill etiketleri için kullanılabilir.

Varsayılan ayırma yöntemi boşluk ve ince border’dır. Gölge istisnadır; varsayılan yüzey ayırma yöntemi değildir.

## 6. Buton sistemi

**Birincil buton:** Bordo zemin ve beyaz yazı kullanır.

**İkincil buton:** Açık veya şeffaf zemin, koyu yazı ve ince border kullanır.

Görev odaklı CTA örnekleri:

- Derse Başla
- Slaytları Aç
- Ders Planını İndir
- Etkinliği Başlat
- Evrakları Gör

Keşif ve navigasyon odaklı CTA örnekleri:

- 5. Sınıfı Keşfet
- Dersleri Keşfet

“Keşfet” tek başına kullanılmamalıdır.

Aynı görevi temsil eden birden fazla baskın CTA oluşturulmaz. Ancak kullanıcının önünde iki eşdeğer ana yol varsa iki güçlü eylem aynı görsel ağırlıkta sunulabilir.

## 7. Kart ve yüzey sistemi

Varsayılan yaklaşım kart değildir.

Öncelik sırası:

- açık editoryal bölüm,
- çizgili liste,
- ince ayırıcı,
- gerekli olduğunda kart.

Kart yalnızca içerik bağımsız bir nesneyse kullanılmalıdır. Her bilgi ayrı bir kutuya kapatılmamalıdır. Açık yüzeyler, ölçülü iç boşluk ve düşük görsel gürültü korunmalıdır.

## 8. Navigasyon

- Logo solda bulunur.
- Ana navigasyon merkezde veya ana kullanılabilir alanda konumlanır.
- Arama ve temel eylem sağda bulunur.
- Aktif bölüm bordo renk ve ek bir görsel işaretle belirtilir.
- Masaüstünde en fazla 6–7 ana bağlantı gösterilir.
- Mobilde masaüstü navigasyonu sıkıştırılmaz; yapı yeniden akar.

## 9. Görsel kullanım

Site arayüzü sakin kalır. Renk ve oyun ders materyallerinde yaşar.

Clay veya 3D görseller:

- içerik ya da ders karakteri taşıyabilir,
- dekoratif UI elemanı olarak kullanılmaz,
- her bölümde gereksiz biçimde tekrarlanmaz.

Görseller konuya katkı sağlamalıdır. Arayüzü teknolojik göstermek amacıyla klişe ikon veya nesneler eklenmemelidir.

## 10. Responsive

| Token | Değer |
| --- | ---: |
| `--breakpoint-sm` | 480 px |
| `--breakpoint-md` | 768 px |
| `--breakpoint-lg` | 1024 px |
| `--breakpoint-xl` | 1280 px |

Mobil tasarım, masaüstünün küçültülmüş hâli değildir. İçerik hiyerarşisi tablet, mobil ve yatay telefon için yeniden düzenlenir.

Minimum dokunma hedefi `44 × 44 px`’tir.

## 11. Kesinlikle kullanılmayacaklar

- teal veya mavi ana arayüz,
- gradient,
- neon,
- glassmorphism,
- aşırı gölge,
- aşırı radius,
- her şeyi karta dönüştürme,
- devre izi dekorasyonu,
- çip, robot veya kod klişesi,
- gereksiz 3D UI,
- aşırı maskot kullanımı,
- geniş koyu siyah yüzeyler,
- krem veya sarı nostaljik eğitim sitesi görünümü,
- büyük başlıklarda Mono,
- belirsiz CTA,
- masaüstünü küçülterek yapılmış mobil tasarım.

## 12. Ana görsel referans

Work alanına yüklenmiş ve kullanıcı tarafından onaylanmış KeskinLab ana sayfa görseli bu tasarım sisteminin birincil görsel referansıdır.

Eski `marka-rehberi.md` tarihsel referanstır. Design System V2 ile çeliştiği bütün noktalarda bu belge üstündür.
