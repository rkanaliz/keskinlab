# KeskinLab · İçerik ve Görsel Üretim Mimarisi

Bu belge, KeskinLab ders içeriklerinin görsel üretiminde bağlayıcı üretim sözleşmesidir. Amaç, içerik üretiminin zaman içinde jenerik sunum estetiğine, yapay zekâ şablonlarına veya KeskinLab marka kimliğiyle çelişen görsel dillere kaymasını engellemektir.

Bu belge `lesson-spec` mimarisinin görsel/üretim katmanıdır. Lesson spec **ne öğretileceğini ve dersin nasıl akacağını**, bu belge ise **o pedagojik akışın nasıl görselleştirileceğini** belirler.

---

## 1. Temel ilke: Önce tema dili, sonra materyal

KeskinLab'da bir haftanın görselleri doğrudan üretilmez.

Zorunlu sıra:

1. canonical öğretim programı / yıllık plan
2. `lesson-spec`
3. haftalık pedagojik storyboard
4. ilgili temanın görsel dili
5. tek bir `visual master / style frame`
6. öğretmen onayı
7. üretim paketleri
8. görsel ve pedagojik QA
9. repository entegrasyonu

**Style frame onaylanmadan toplu slayt/infografik üretimine geçilmez.**

Bu kural, aynı konu için birbirinden kopuk veya jenerik tasarım setlerinin oluşmasını önleyen quality gate'tir.

---

## 2. Marka kaynağı ve değiştirilemez kurallar

KeskinLab marka kimliğinin tek kaynakları repository'deki gerçek brand asset'leridir:

- `brand/marka-kilavuzu.html`
- `brand/logo-horizontal.svg`
- `brand/logo-stacked.svg`
- `brand/logo-mark.svg`
- `brand/logo-mark-white.svg`
- `brand/logo-badge.svg`
- `brand/favicon.svg`
- `brand/devre-karakteri.svg`

Yeni, uydurma veya “yaklaşık” KeskinLab logosu üretilmez.

### Kesin yasak

KeskinLab adı nedeniyle aşağıdaki kimya/laboratuvar metaforları **marka unsuru olarak kullanılmaz**:

- beher
- erlenmayer
- deney tüpü
- kimya şişesi
- laboratuvar kabı
- molekül/kimya laboratuvarı klişeleri

KeskinLab'ın görsel kökü **bilişim, devre, terminal, düğüm ve bilgi akışı** dilidir; kimya laboratuvarı değildir.

### Gerçek marka karakteri

Logo ve karakter sistemi `Devre Karakteri`nden doğar. Devre Karakteri:

- dekoratif dolgu olarak her ekrana konmaz,
- yalnız pedagojik veya işlevsel bir rol varsa kullanılır,
- marka imzasının yerine rastgele maskot olarak çoğaltılmaz.

---

## 3. Sabit marka dili

Renk, tipografi ve temel davranış mevcut marka kılavuzundan korunur.

### Renk çekirdeği

- Ink: `#12182B`
- Teal: `#1E8A80`
- Deep Teal: `#146059`
- Amber: `#E2A63B`
- Deep Amber: `#B9822A`
- Background: `#F4F6F3`
- Surface: `#FFFFFF`
- Border: `#DCE1DE`
- Soft text: `#565F70`
- Muted text: `#8890A0`

### Tipografi

- Başlıklar: **Space Grotesk**
- Gövde: **Inter**
- Etiket, kod, metadata: **IBM Plex Mono**

### Marka davranışı

- düz renkler
- kontrollü boşluk
- ince çizgi/devre motifleri
- sakin, teknik, güvenilir görünüm
- ağır gölge yok
- glassmorphism yok
- neon teknoloji estetiği yok
- dekoratif gradient zorunlu değildir; marka sisteminde varsayılan yaklaşım düz renk ve yüzeydir

---

## 4. Tema-temelli görsel sistem

KeskinLab'da tüm haftalar aynı sunum şablonunu kullanmaz.

Her öğretim teması için önce ayrı bir **görsel kavram** belirlenir. Bu görsel kavram:

- temanın kavramsal doğasından türemeli,
- marka çekirdeğiyle uyumlu olmalı,
- o temanın haftalarını bir aile gibi göstermeli,
- fakat her haftayı birbirinin kopyası hâline getirmemelidir.

Tema değiştiğinde görsel metafor da değişebilir. Sabit kalan şey KeskinLab marka çekirdeğidir.

### Görsel tema dosyası

Her tema için üretim başlamadan önce şu bilgiler kilitlenmelidir:

- tema adı
- ana görsel metafor
- kompozisyon mantığı
- grafik/şema dili
- fotoğraf/illüstrasyon/line-art kullanımı
- ikon yaklaşımı
- tipografik hiyerarşi
- marka kullanım yoğunluğu
- kaçınılacak klişeler
- haftalara göre alt motifler

---

## 5. Tema 1 görsel yönü

### Tema 1 · Bilişim Teknolojilerinin Hayatımızdaki Yeri

Ana görsel kavram:

**Bilgi Akışı / Gündelik Dijital İzler**

Ana fikir, “teknoloji cihazları sergilemek” değil; **bilgi, insan, ihtiyaç, cihaz ve kullanım alanları arasındaki ilişkiyi görünür hâle getirmektir.**

### Kullanılabilecek motifler

- ince devre izleri
- bağlantı düğümleri
- veri/akış yolları
- yön değiştiren bağlantılar
- terminal benzeri küçük açıklama satırları
- sınıflandırma eksenleri
- katman/hiyerarşi
- geçmiş ↔ günümüz dönüşüm çizgileri
- sebep → sonuç ilişkileri
- bilgi → işlem → kullanım zincirleri

Bu motifler dekorasyon olarak değil, **bilginin görsel organizasyonu** olarak kullanılmalıdır.

### Haftalık alt motif önerileri

- Hafta 1 → **sınıflandırma / bağlantı haritası**
- Hafta 2 → **etki / sebep-sonuç sinyalleri**
- Hafta 3–4 → **dijital iz / kimlik katmanları**
- Hafta 5–6 → **örüntü / yapay zekâ / sorgulama**
- Hafta 7 → **sistem / dosya ağacı / hiyerarşi**

Bu alt motifler Tema 1 ailesi içinde kalır; haftaların görsel kimliğini birbirinden ayırır.

---

## 6. “Ders yüzeyi” yaklaşımı

KeskinLab için üretilen şey klasik anlamda bir PowerPoint şablonu değildir.

Her ekran bir **ders yüzeyi**dir ve en az bir pedagojik işlev üstlenmelidir:

- anlatır
- düşündürür
- yaptırır
- karşılaştırır
- sınıflandırır
- tartıştırır
- kanıt toplar
- kontrol eder

Bu işlevlerden hiçbirini yapmayan sırf estetik amaçlı “süs slaytı” üretilmez.

Slayt sayısı önceden sabitlenmez. Bir pedagojik adım 1 ekranla da 8 ekranla da çözülebilir.

---

## 7. Anti-klişe sözleşmesi

Aşağıdaki yaklaşımlar varsayılan olarak **reddedilir**:

- büyük yuvarlak numara rozetleriyle sıralanan içerikler
- her fikri ayrı kart/kutu içine koyma
- “Görev / Düşün / Not / İpucu” kutularından oluşan Canva benzeri şablonlar
- cihazlardan oluşan clipart ızgaraları
- çocuk kitabı tarzı jenerik teknoloji ikonları
- rastgele renkli ikon koleksiyonları
- stok eğitim sunumu estetiği
- yapay zekâ üretimi olduğu hemen anlaşılan eşit kart kompozisyonları
- gereksiz soru işareti ikonları
- roket, ampul, kupa, hedef, sihirli değnek gibi eğitim klişeleri
- emoji ikonları
- 3D ikonlar
- ağır gölge ve plastik arayüz görünümü
- sırf ekran boş kalmasın diye eklenen dekoratif görseller
- her sayfada büyük KeskinLab logosu
- içerikle ilgisi olmayan maskot kullanımı

Kart veya kutu gerçekten semantik bir yapı için gerekliyse kullanılabilir; ancak **varsayılan kompozisyon aracı değildir.**

---

## 8. Görsel malzeme dili

Cihaz veya nesne gösterimi gerektiğinde tercih sırası:

1. pedagojik anlatımı taşıyan özgün diyagram/şema
2. KeskinLab dilinde sade teknik line-art / silüet
3. gerektiğinde kontrollü ve bağlama uygun gerçekçi görsel

“Her cihazın sevimli clipart çizimini koy” yaklaşımı kullanılmaz.

Bir görsel, yalnızca nesneyi tanıtmak için değil, **ilişkiyi açıklamak için** seçilir.

---

## 9. Marka yerleşimi

KeskinLab markası ders içeriğinin önüne geçmez.

Tercih:

- küçük `logo-mark.svg`
- gerektiğinde küçük `logo-horizontal.svg`
- düşük yoğunluklu marka imzası

Kaçınılacak:

- ekranın büyük bir bölümünü kaplayan KeskinLab yazısı
- sahte logo üretimi
- logo yanında ayrı bir laboratuvar simgesi
- her slaytta aynı köşe rozeti zorunluluğu

Marka görünürlüğü **imza düzeyinde**, pedagojik içerik ise birincil düzeydedir.

---

## 10. Style frame quality gate

Her yeni tema için üretim başlamadan önce yalnızca **1–2 adet style frame** hazırlanır.

Style frame şu konuları test eder:

- kompozisyon
- tipografik ölçek
- renk dengesi
- devre/tema motifinin yoğunluğu
- nesne çizim dili
- gerçek logo kullanımı
- ekranın sınıfta uzaktan okunabilirliği
- jenerik şablondan ayrışma

Öğretmen onayı alınmadan seri üretime geçilmez.

Style frame reddedilirse o görsel yaklaşım altında üretilen materyaller production'a alınmaz.

---

## 11. Üretim paketleri

Onaylı style frame sonrası içerik, pedagojik bloklar hâlinde üretilir.

Örneğin Hafta 01 için:

- Paket A → Period 1 / giriş + kavramlar
- Paket B → sınıflandırma
- Paket C → Period 1 kapanış
- Paket D → geçmiş ↔ günümüz
- Paket E → öğrenci uygulaması
- Paket F → ortaklaştırma + çıkış kanıtı
- Paket G → destekleme / zenginleştirme / öğretmen araçları

Teknik görsel üretim limiti hiçbir zaman pedagojik içerik standardı değildir.

---

## 12. QA: Bir görsel hangi durumda reddedilir?

Aşağıdaki koşullardan biri varsa materyal hazır sayılmaz:

- gerçek KeskinLab kimliğini kullanmıyorsa
- uydurma logo veya kimya/laboratuvar metaforu içeriyorsa
- temanın onaylı görsel dilinden kopuyorsa
- ders yüzeyinin pedagojik işlevi belirsizse
- sadece dekoratifse
- klişe eğitim şablonuna dönüşmüşse
- metin ve görsel birbirini tekrar etmekten başka iş yapmıyorsa
- sınıfta uzaktan okunamayacak yoğunluktaysa
- görsel, ilişkileri açıklamak yerine yalnız nesne koleksiyonu gösteriyorsa
- öğrencinin yaş düzeyine uygun değilse
- marka içeriğin önüne geçiyorsa

---

## 13. Mimari ilişki

KeskinLab üretim zinciri bundan sonra şu şekilde düşünülmelidir:

```text
CANONICAL PROGRAM
      ↓
LESSON SPEC
      ↓
PEDAGOJİK STORYBOARD
      ↓
THEME VISUAL SYSTEM
      ↓
STYLE FRAME APPROVAL
      ↓
ASSET PRODUCTION
      ↓
VISUAL + PEDAGOGICAL QA
      ↓
RESOURCE REGISTRY
      ↓
LESSON LIVING SPACE
```

`lesson-spec` renderer sözleşmesi değil, pedagojik sözleşmedir.

Bu belge de bir “tasarım şablonu” değil, **görsel üretim kalite sözleşmesidir.**

Amaç her haftayı aynı göstermek değil; KeskinLab'a ait olduğu hissedilen, temaya özgü ve öğretilebilir görsel sistemler üretmektir.
