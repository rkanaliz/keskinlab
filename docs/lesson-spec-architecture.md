# KeskinLab · Ders Yaşam Alanı — Lesson Spec Mimarisi

> Durum: Tasarım dokümanı  
> Branch: `lesson-spec-architecture`  
> Amaç: KeskinLab haftalık materyal kataloğunu, öğretmenin 40+40 dakikalık dersi başlatıp sürdürebildiği pedagojik bir “ders yaşam alanı”na dönüştürecek veri katmanını tanımlamak.  
> Bu doküman production implementasyonu değildir.

---

## 1. Problem tanımı

KeskinLab’ın mevcut sistemi materyalleri başarıyla topluyor, üretim çıktısına dönüştürüyor ve sınıf sayfasında gösteriyor. Ancak mevcut akışın temel bir sınırı var: sayfa pedagojik ana göre değil, materyal tipine göre örgütleniyor.

Bugünkü model kabaca şunu bilir:

- sunum
- infografik
- ders notu
- öğrenci etkinliği
- ölçme-değerlendirme
- öğretmen materyali
- Lesson Player etkinliği

Fakat şu soruların cevabı veri modelinde yoktur:

- Öğretmen bu materyali dersin hangi anında kullanacak?
- Bu adım kaç dakika sürmeli?
- Hangi öğrenme çıktısının hangi süreç bileşenini karşılıyor?
- Öğrenci o anda ne yapacak?
- Öğretmen hangi soruyu/yönergeyi verecek?
- Öğrenmenin gerçekleştiğine dair hangi kanıt oluşacak?
- Teknoloji çalışmazsa aynı pedagojik amaç nasıl sürdürülecek?
- Destekleme ve zenginleştirme hangi anda devreye girecek?

Bu boşluğu dolduracak katman `lesson-spec` olacaktır.

Temel ilke:

> `lesson-spec` bir dosya kataloğu değildir. Bir öğretim senaryosudur.

---

## 2. Mevcut sistemde korunacak parçalar

Bu mimari mevcut çalışan üretim sistemini yeniden yazmak için tasarlanmamıştır.

Korunacak temel davranışlar:

1. `materyaller/{course}/hafta{NN}/{tip}/{NN}.{ext}` yapısı devam eder.
2. `scripts/generate-site-data.mjs` materyal klasörlerindeki tüm uygun dosyaları dinamik biçimde taramaya devam eder.
3. Sunum veya başka bir materyal türü için sabit adet sınırı getirilmez.
4. `generated/materials.json` ve `generated/courses.json` mevcut üretim görevlerini sürdürür.
5. Spec olmayan haftalarda mevcut renderer fallback olarak çalışmaya devam edebilir.
6. Production HTML/CSS/JS dosyaları bu tasarım fazında değiştirilmez.

Önemli karar:

> Görsel üretim aracının tek seferde 10 görsel üretebilmesi, KeskinLab için pedagojik veya teknik bir içerik standardı değildir.

Bir hafta 7, 18, 22, 35 veya daha fazla sınıf ekranına ihtiyaç duyabilir. Gerekirse üretim 01–10, 11–20, 21–30 gibi birden fazla üretim partisine bölünür.

---

## 3. Ana mimari değişiklik: materyal sırasından pedagojik akışa

### Eski zihinsel model

```text
Sunum
Lesson Player
Özet
Öğrenci Etkinliği
Ders Notu
Öğretmen Masası
```

### Yeni zihinsel model

```text
HAFTA
│
├── PERIOD 1 · 40 dk
│   ├── pedagojik adım
│   ├── pedagojik adım
│   ├── pedagojik adım
│   └── öğrenme kanıtı / kapanış
│
└── PERIOD 2 · 40 dk
    ├── yeniden bağlanma
    ├── pedagojik adım
    ├── pedagojik adım
    └── öğrenme kanıtı / kapanış
```

Sunum, PDF, görsel, çalışma kâğıdı, Lesson Player etkinliği, tartışma sorusu ve diğer materyaller bu adımların içinde kullanılan `resource` nesneleridir.

---

## 4. Temel sınıf birimi: `period`

KeskinLab’da temel sınıf birimi kesintisiz 80 dakikalık bir lesson değil, 40 dakikalık ders saatidir.

Bu nedenle üst düzey dizi adı:

```text
periods[]
```

olacaktır.

### Neden 80 dakikalık tek blok kullanılmıyor?

- İki ders arasında teneffüs olabilir.
- İlk ders planlandığı gibi tamamlanmamış olabilir.
- Öğretmen ikinci derse başka cihazdan girebilir.
- Kullanıcı hesabı / sunucu taraflı ilerleme kaydı zorunlu değildir.
- İkinci ders bağımsız başlatılabilmelidir.
- Haftanın iki ders saati farklı pedagojik amaçlara ayrılabilir.

Bu yüzden 5. sınıf Hafta 01 gibi iki ders saatlik bir hafta:

```text
Period 1 → 40 dakika
Period 2 → 40 dakika
```

olarak modellenir.

Schema, `plannedMinutes` değerini 40 veya 80 ile sabitlemez. Süre doğruluğu canonical ders verisine göre validator tarafından denetlenir.

### 4.1 Core, optional ve extension teslim rolleri

Bir period içindeki her pedagojik step, öğretmenin varsayılan 40 dakikalık rotada o adımla nasıl karşılaşacağını açıkça belirtir:

- `core`: “Çekirdek rotayı çalıştır” akışında otomatik ilerlenen zorunlu adım.
- `optional`: Bir core adımın yerine seçilebilen kısa alternatif örnek. Alternatif ise `alternativeToStepId` ile aynı period içindeki core adıma bağlanır.
- `extension`: Bir core adımı ek süreyle derinleştiren çalışma. `anchorStepId` ile aynı period içindeki core adıma bağlanır.

Süre alanı her rolde mevcut `minutes` alanıdır; ikinci bir süre alanı oluşturulmaz. `plannedMinutes` yalnız `deliveryRole: "core"` adımların `minutes` toplamıdır. Optional ve extension süreleri öğretmene seçim etkisini göstermek için korunur ancak period toplamına eklenmez.

```json
{
  "id": "past-present-letter-message",
  "deliveryRole": "core",
  "minutes": 3
}
```

```json
{
  "id": "past-present-map-navigation",
  "deliveryRole": "optional",
  "alternativeToStepId": "past-present-letter-message",
  "minutes": 3
}
```

```json
{
  "id": "technology-researchers",
  "deliveryRole": "extension",
  "anchorStepId": "match-past-present",
  "minutes": 9
}
```

Bir step aynı anda `anchorStepId` ve `alternativeToStepId` taşımaz. Core step ilişki alanı taşımaz. Delivery rolü pedagojik step’e aittir; altyazı, transcript, durağan kare veya düşük teknoloji yedeği gibi erişilebilirlik/fallback özellikleri resource düzeyinde kalır.

---

## 5. Stabil müfredat referansları

Süreç bileşenleri yalnız `a`, `b`, `c` gibi harflerle referanslanmayacaktır.

Bunun iki nedeni vardır:

1. Aynı haftada birden fazla öğrenme çıktısı bulunabilir ve her birinin `a`, `b`, `c` süreç bileşenleri olabilir.
2. Türkçe süreç bileşenlerinde `ç` gibi harfler de kullanılabilir.

Bu nedenle tam kimlik kullanılacaktır:

```text
BTY.5.1.1.a
BTY.5.1.1.b
BTY.5.1.1.c
```

Bir adım birden fazla bileşene hizmet edebilir:

```json
"curriculumRefs": [
  "BTY.5.1.1.b",
  "BTY.5.1.1.c"
]
```

Validator, canonical hafta verisindeki öğrenme çıktıları ve süreç bileşenlerinden beklenen referans setini kendisi üretir.

---

## 6. `resources` registry

Pedagojik adımlar fiziksel dosya numaralarına doğrudan bağlanmayacaktır.

Yanlış yaklaşım:

```json
{
  "type": "sunum",
  "indexes": ["01", "02", "03", "04", "05"]
}
```

bu yapıyı her step içine yazmaktır.

Çünkü yeni bir slayt araya eklendiğinde birçok pedagojik adımın dosya numarası değişebilir.

Bunun yerine spec’in üst seviyesinde bir `resources` registry bulunur:

```json
"resources": {
  "kavram-slides": {
    "kind": "material",
    "type": "sunum",
    "indexes": ["01", "02", "03", "04", "05"]
  },
  "siniflandirma-player": {
    "kind": "lessonPlayer",
    "activityId": "classify-use",
    "requiresTechnology": true,
    "fallbackResourceRef": "siniflandirma-kartlari"
  }
}
```

Step yalnız pedagojik resource kimliğini kullanır:

```json
"resourceRefs": ["kavram-slides"]
```

Böylece:

- pedagojik akış fiziksel dosya adlarından ayrılır,
- renderer ve validator daha stabil referanslarla çalışır,
- materyal sırası değişse bile öğretim senaryosunun anlamı korunur.

---

## 7. Teknoloji bağımlılığı ve fallback

Her materyal kullanılan adım için offline alternatif zorunlu değildir.

Örneğin basılı bir öğrenci çalışma kâğıdı zaten düşük-teknoloji bir kaynaktır.

Fallback kuralı resource düzeyinde tanımlanacaktır:

```json
{
  "kind": "lessonPlayer",
  "activityId": "classify-use",
  "requiresTechnology": true,
  "fallbackResourceRef": "siniflandirma-kartlari"
}
```

Validator:

- `requiresTechnology: true` ise `fallbackResourceRef` bulunmasını,
- fallback kaynağının gerçekten `resources` içinde tanımlı olmasını,
- fallback zincirinde döngü oluşmamasını

kontrol eder.

---

## 8. Öğrenme kanıtı (`evidence`)

Öğrenme kanıtı serbest metin yerine yapılandırılmış nesne olarak tutulacaktır.

```json
"evidence": {
  "observable": "Öğrenci teknolojiyi kullanım alanına göre sınıflandırır.",
  "criterion": "Verilen örneklerin çoğunu uygun kullanım alanıyla eşleştirir ve en az bir seçimini gerekçelendirir.",
  "mode": "observation"
}
```

Başlangıç `mode` değerleri:

- `oral`
- `observation`
- `worksheet`
- `quiz`
- `product`
- `peer-review`

Her step’in evidence üretmesi zorunlu değildir. Ancak her period sonunda veya period genelinde en az bir anlamlı öğrenme kanıtı bulunmalıdır.

Not: Yüzdelik veya sayısal başarı ölçütleri yalnız resmî kaynakta veya öğretmen tarafından bilinçli olarak belirlenmişse kullanılmalıdır. Spec, keyfî başarı eşiği üretmemelidir.

---

## 9. Önerilen dosya yapısı

```text
lesson-specs/
  lesson-spec.schema.json
  5-sinif/
    hafta01.json
    hafta02.json
    ...
  6-sinif/
    hafta01.json
    ...
  robotik/
  yapay-zeka/

scripts/
  validate-lesson-spec.mjs

docs/
  lesson-spec-architecture.md
```

Bu doküman tasarım fazıdır. `lesson-specs/` ve validator henüz production dosyaları olarak oluşturulmayacaktır.

---

## 10. Revize schema tasarımı

Aşağıdaki JSON Schema, tasarım referansıdır; henüz repository’de gerçek schema dosyası olarak uygulanmayacaktır.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://keskinlab.com/schema/lesson-spec.schema.json",
  "title": "KeskinLab Lesson Spec",
  "type": "object",
  "required": [
    "schemaVersion",
    "course",
    "week",
    "learningOutcomes",
    "resources",
    "periods"
  ],
  "additionalProperties": false,
  "properties": {
    "schemaVersion": {
      "const": 1
    },
    "course": {
      "type": "string",
      "minLength": 1
    },
    "week": {
      "type": "integer",
      "minimum": 1
    },
    "learningOutcomes": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "resources": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/$defs/resource"
      }
    },
    "periods": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/$defs/period"
      }
    }
  },
  "$defs": {
    "period": {
      "type": "object",
      "required": [
        "periodNo",
        "title",
        "plannedMinutes",
        "steps"
      ],
      "additionalProperties": false,
      "properties": {
        "periodNo": {
          "type": "integer",
          "minimum": 1
        },
        "title": {
          "type": "string",
          "minLength": 1
        },
        "plannedMinutes": {
          "type": "integer",
          "minimum": 1
        },
        "steps": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/$defs/step"
          }
        }
      }
    },
    "step": {
      "type": "object",
      "required": [
        "id",
        "phase",
        "deliveryRole",
        "minutes",
        "curriculumRefs",
        "teacherAction",
        "studentAction",
        "resourceRefs"
      ],
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "phase": {
          "type": "string",
          "enum": [
            "giris",
            "kesfetme",
            "dogrudan-ogretim",
            "uygulama",
            "tartisma",
            "pekistirme",
            "degerlendirme",
            "kapanis"
          ]
        },
        "deliveryRole": {
          "type": "string",
          "enum": ["core", "optional", "extension"]
        },
        "anchorStepId": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "alternativeToStepId": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "minutes": {
          "type": "integer",
          "minimum": 1
        },
        "curriculumRefs": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "teacherAction": {
          "type": "string",
          "minLength": 1
        },
        "studentAction": {
          "type": "string",
          "minLength": 1
        },
        "teacherPrompt": {
          "type": "string"
        },
        "resourceRefs": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "evidence": {
          "$ref": "#/$defs/evidence"
        },
        "support": {
          "type": "string"
        },
        "enrichment": {
          "type": "string"
        }
      }
    },
    "evidence": {
      "type": "object",
      "required": ["observable", "mode"],
      "additionalProperties": false,
      "properties": {
        "observable": {
          "type": "string",
          "minLength": 1
        },
        "criterion": {
          "type": "string"
        },
        "mode": {
          "enum": [
            "oral",
            "observation",
            "worksheet",
            "quiz",
            "product",
            "peer-review"
          ]
        }
      }
    },
    "resource": {
      "oneOf": [
        {
          "type": "object",
          "required": ["kind", "type", "indexes"],
          "additionalProperties": false,
          "properties": {
            "kind": {
              "const": "material"
            },
            "type": {
              "type": "string",
              "minLength": 1
            },
            "indexes": {
              "oneOf": [
                {
                  "const": "all"
                },
                {
                  "type": "array",
                  "minItems": 1,
                  "uniqueItems": true,
                  "items": {
                    "type": "string",
                    "pattern": "^\\d{2}$"
                  }
                }
              ]
            },
            "requiresTechnology": {
              "type": "boolean"
            },
            "fallbackResourceRef": {
              "type": "string",
              "minLength": 1
            }
          }
        },
        {
          "type": "object",
          "required": ["kind", "activityId"],
          "additionalProperties": false,
          "properties": {
            "kind": {
              "const": "lessonPlayer"
            },
            "activityId": {
              "type": "string",
              "minLength": 1
            },
            "requiresTechnology": {
              "type": "boolean"
            },
            "fallbackResourceRef": {
              "type": "string",
              "minLength": 1
            }
          }
        },
        {
          "type": "object",
          "required": ["kind", "description"],
          "additionalProperties": false,
          "properties": {
            "kind": {
              "const": "teacherLed"
            },
            "description": {
              "type": "string",
              "minLength": 1
            },
            "requiresTechnology": {
              "type": "boolean"
            },
            "fallbackResourceRef": {
              "type": "string",
              "minLength": 1
            }
          }
        }
      ]
    }
  }
}
```

### Schema tasarım notları

- `course` schema içinde sabit enum’a gömülmedi; canonical course eşlemesini validator yapar.
- `plannedMinutes` yalnız pozitif integer’dır.
- Her step `deliveryRole` taşır; izinli değerler `core`, `optional`, `extension`dır.
- Süre için yalnız mevcut `minutes` alanı kullanılır.
- `plannedMinutes`, yalnız core step sürelerinin toplamıdır.
- Optional alternatifler `alternativeToStepId`, extension adımlar `anchorStepId` ile aynı period içindeki core adıma bağlanır.
- `periods` sayısına üst sınır konulmaz.
- Resource sayısına üst sınır konulmaz.
- Material `indexes` dizisine üst sınır konulmaz.
- `curriculumRefs` biçimi schema tarafından yüzeysel olarak kabul edilir; canonical geçerliliği validator denetler.
- `teacherLed` resource, fiziksel dosya gerektirmeyen sınıf içi tartışma/tahta çalışması gibi yüzeyleri isimlendirmek için kullanılabilir.

---

## 11. 5. Sınıf BTY · Hafta 01 örnek lesson-spec

Bu bölüm yalnız temel JSON yapısını gösteren kompakt bir mimari örnektir; Hafta 01'in güncel pedagojik sırasını veya CORE/FLEX dakika dağılımını temsil etmez. Güncel ve doğrulanan kaynak `lesson-specs/5-sinif/hafta01.json`, ayrıntılı yüzey akışı ise `docs/5-sinif-hafta01-content-storyboard.md` dosyasıdır.

Hafta konusu: **Bilişim Teknolojilerinin Sınıflandırılması**  
Öğrenme çıktısı: **BTY.5.1.1 Günlük yaşamda kullanılan bilişim teknolojilerini sınıflandırabilme**

Süreç bileşenleri:

- `BTY.5.1.1.a` — Bilişim teknolojilerine ilişkin temel kavramları belirler.
- `BTY.5.1.1.b` — Geçmişten günümüze bilişim teknolojilerindeki benzerlikleri ve farklılıkları ilişkilendirir.
- `BTY.5.1.1.c` — Bilişim teknolojilerini kullanım alanlarına göre gruplandırır.

```json
{
  "schemaVersion": 1,
  "course": "5-sinif",
  "week": 1,
  "learningOutcomes": [
    "BTY.5.1.1"
  ],
  "resources": {
    "haftaya-giris-gorseli": {
      "kind": "material",
      "type": "hafta-ozeti",
      "indexes": ["01"],
      "requiresTechnology": false
    },
    "temel-kavram-slides": {
      "kind": "material",
      "type": "sunum",
      "indexes": ["01", "02", "03", "04", "05"],
      "requiresTechnology": true,
      "fallbackResourceRef": "ders-notu"
    },
    "gecmis-gunumuz-slides": {
      "kind": "material",
      "type": "sunum",
      "indexes": ["06", "07", "08"],
      "requiresTechnology": true,
      "fallbackResourceRef": "gecmis-gunumuz-infografik"
    },
    "gecmis-gunumuz-infografik": {
      "kind": "material",
      "type": "infografik",
      "indexes": ["02"],
      "requiresTechnology": false
    },
    "ders-notu": {
      "kind": "material",
      "type": "ders-notu",
      "indexes": ["01"],
      "requiresTechnology": false
    },
    "ogrenci-etkinligi": {
      "kind": "material",
      "type": "ogrenci-etkinligi",
      "indexes": ["01"],
      "requiresTechnology": false
    },
    "siniflandirma-player": {
      "kind": "lessonPlayer",
      "activityId": "classify-use",
      "requiresTechnology": true,
      "fallbackResourceRef": "ogrenci-etkinligi"
    },
    "gecmis-gunumuz-player": {
      "kind": "lessonPlayer",
      "activityId": "match-past-present",
      "requiresTechnology": true,
      "fallbackResourceRef": "gecmis-gunumuz-infografik"
    },
    "hizli-kontrol-player": {
      "kind": "lessonPlayer",
      "activityId": "quiz-evidence",
      "requiresTechnology": true,
      "fallbackResourceRef": "sozlu-cikis-kontrolu"
    },
    "sozlu-cikis-kontrolu": {
      "kind": "teacherLed",
      "description": "Öğretmenin üç kısa çıkış sorusunu sözlü olarak yöneltmesi.",
      "requiresTechnology": false
    },
    "sinif-tartismasi": {
      "kind": "teacherLed",
      "description": "Aynı teknolojinin kullanım amacına göre birden fazla alanda sınıflandırılabileceği üzerine sınıf tartışması.",
      "requiresTechnology": false
    }
  },
  "periods": [
    {
      "periodNo": 1,
      "title": "Kavramları Keşfet ve Sınıflandır",
      "plannedMinutes": 40,
      "steps": [
        {
          "id": "on-bilgiyi-yokla",
          "phase": "giris",
          "deliveryRole": "core",
          "minutes": 5,
          "curriculumRefs": [
            "BTY.5.1.1.a"
          ],
          "teacherAction": "Öğrencilerin günlük yaşamda karşılaştıkları bilişim teknolojilerini ortaya çıkaracak kısa bir beyin fırtınası başlatır.",
          "studentAction": "Evde ve okula gelirken karşılaştığı teknoloji örneklerini paylaşır.",
          "teacherPrompt": "Bu sabah uyanmanızdan okula gelmenize kadar hangi teknolojilerle karşılaştınız?",
          "resourceRefs": [
            "haftaya-giris-gorseli"
          ],
          "evidence": {
            "observable": "Öğrenci günlük yaşamdan en az bir bilişim teknolojisi örneği ifade eder.",
            "mode": "oral"
          }
        },
        {
          "id": "temel-kavramlari-kur",
          "phase": "kesfetme",
          "deliveryRole": "core",
          "minutes": 10,
          "curriculumRefs": [
            "BTY.5.1.1.a"
          ],
          "teacherAction": "Öğrenci cevaplarından hareketle bilgi, teknoloji ve bilişim teknolojileriyle ilgili temel kavramları yapılandırır.",
          "studentAction": "Kavramları günlük yaşam örnekleriyle ilişkilendirir ve kendi örneklerini açıklar.",
          "teacherPrompt": "Bir aracın yalnızca elektronik olması onu bilişim teknolojisi yapar mı? Neden?",
          "resourceRefs": [
            "temel-kavram-slides"
          ]
        },
        {
          "id": "ilk-siniflandirma",
          "phase": "uygulama",
          "deliveryRole": "core",
          "minutes": 15,
          "curriculumRefs": [
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Öğrencilerden farklı bilişim teknolojilerini kullanım alanlarına göre gruplandırmalarını ve seçimlerini açıklamalarını ister.",
          "studentAction": "Teknolojileri kullanım alanlarına göre sınıflandırır ve seçtiği sınıflandırmayı gerekçelendirir.",
          "teacherPrompt": "Bu teknolojiyi neden bu kullanım alanına yerleştirdiniz? Başka bir alanda da kullanılabilir mi?",
          "resourceRefs": [
            "siniflandirma-player"
          ],
          "support": "Seçenek sayısı azaltılabilir ve hazır kullanım alanı başlıkları verilebilir.",
          "enrichment": "Öğrenciden aynı teknolojinin farklı amaçlarla birden fazla kullanım alanına nasıl girebileceğini açıklaması istenir.",
          "evidence": {
            "observable": "Öğrenci bilişim teknolojilerini kullanım alanına göre gruplandırır ve en az bir sınıflandırma kararını gerekçelendirir.",
            "mode": "observation"
          }
        },
        {
          "id": "siniflandirmayi-sorgula",
          "phase": "tartisma",
          "deliveryRole": "core",
          "minutes": 7,
          "curriculumRefs": [
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Farklı öğrenci sınıflandırmalarını karşılaştırır ve sınıflandırma ölçütünün önemini tartışmaya açar.",
          "studentAction": "Farklı sınıflandırmaları karşılaştırır, hangi ölçütün kullanıldığını açıklar.",
          "teacherPrompt": "Ölçüt değişirse aynı teknoloji başka bir gruba geçebilir mi?",
          "resourceRefs": [
            "sinif-tartismasi"
          ]
        },
        {
          "id": "birinci-ders-cikisi",
          "phase": "kapanis",
          "deliveryRole": "core",
          "minutes": 3,
          "curriculumRefs": [
            "BTY.5.1.1.a",
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Dersin iki ana fikrini öğrencilerden kısa cümlelerle tekrar ister.",
          "studentAction": "Bir temel kavramı ve bir sınıflandırma örneğini kendi cümlesiyle ifade eder.",
          "resourceRefs": [],
          "evidence": {
            "observable": "Öğrenci temel kavramlardan birini ve kullanım alanına göre bir sınıflandırma örneğini ifade eder.",
            "mode": "oral"
          }
        }
      ]
    },
    {
      "periodNo": 2,
      "title": "Geçmişten Günümüze İlişkilendir ve Kanıtla",
      "plannedMinutes": 40,
      "steps": [
        {
          "id": "onceki-dersle-bag-kur",
          "phase": "giris",
          "deliveryRole": "core",
          "minutes": 4,
          "curriculumRefs": [
            "BTY.5.1.1.a",
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Bir önceki derste oluşturulan kavram ve sınıflandırma bilgisini kısa sorularla yeniden etkinleştirir.",
          "studentAction": "Önceki dersten hatırladığı kavramları ve sınıflandırma ölçütlerini paylaşır.",
          "teacherPrompt": "Geçen derste bir teknolojiyi hangi ölçüte göre gruplandırmıştık?",
          "resourceRefs": []
        },
        {
          "id": "gecmis-gunumuz-karsilastir",
          "phase": "kesfetme",
          "deliveryRole": "core",
          "minutes": 10,
          "curriculumRefs": [
            "BTY.5.1.1.b"
          ],
          "teacherAction": "Geçmiş ve günümüz teknoloji örneklerini karşılaştırarak benzerlik ve farklılıkları görünür hâle getirir.",
          "studentAction": "Bir geçmiş teknoloji örneğini güncel karşılığıyla ilişkilendirir; benzerlik ve farklılık söyler.",
          "teacherPrompt": "Araç değişmiş olsa da hangi ihtiyaç aynı kalmış olabilir?",
          "resourceRefs": [
            "gecmis-gunumuz-slides"
          ],
          "evidence": {
            "observable": "Öğrenci geçmiş ve günümüz bilişim teknolojileri arasında en az bir benzerlik veya farklılık kurar.",
            "mode": "oral"
          }
        },
        {
          "id": "eslestir-ve-gerekcelendir",
          "phase": "pekistirme",
          "deliveryRole": "core",
          "minutes": 8,
          "curriculumRefs": [
            "BTY.5.1.1.b"
          ],
          "teacherAction": "Geçmişten günümüze eşleştirme etkinliğini yürütür ve her eşleştirmede gerekçe ister.",
          "studentAction": "Geçmiş teknoloji örneklerini güncel karşılıklarıyla eşleştirir ve ilişkiyi açıklar.",
          "resourceRefs": [
            "gecmis-gunumuz-player"
          ]
        },
        {
          "id": "teknoloji-arastirmacilari",
          "phase": "uygulama",
          "deliveryRole": "core",
          "minutes": 10,
          "curriculumRefs": [
            "BTY.5.1.1.b",
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Gruplara seçtikleri teknoloji için ne yaptığı, geçmişte aynı ihtiyacın nasıl karşılandığı, bugün neyin değiştiği ve hangi kullanım alanına girdiği sorularını yöneltir.",
          "studentAction": "Seçtiği teknolojiyi geçmiş-günümüz ve kullanım alanı açısından inceleyip kısa grup açıklaması hazırlar.",
          "teacherPrompt": "Bu teknoloji hangi ihtiyacı karşılıyor, eskiden bu ihtiyaç nasıl karşılanıyordu ve bugün ne değişti?",
          "resourceRefs": [
            "ogrenci-etkinligi"
          ],
          "support": "Daha az seçenek ve hazır soru başlıkları verilebilir; eşli çalışma kullanılabilir.",
          "enrichment": "Öğrenciden seçtiği teknolojinin 3–4 aşamalı mini gelişim çizgisini oluşturması istenebilir.",
          "evidence": {
            "observable": "Öğrenci seçtiği teknolojiyi geçmiş-günümüz ilişkisi ve kullanım alanı açısından açıklar.",
            "mode": "worksheet"
          }
        },
        {
          "id": "ortak-sonuca-ulas",
          "phase": "tartisma",
          "deliveryRole": "core",
          "minutes": 4,
          "curriculumRefs": [
            "BTY.5.1.1.a",
            "BTY.5.1.1.b",
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Öğrenci örneklerini ortaklaştırarak haftanın üç süreç bileşenini birbirine bağlar.",
          "studentAction": "Teknolojinin değişimi, amacı ve kullanım alanı arasındaki ilişkiyi sınıfça ifade eder.",
          "resourceRefs": [
            "sinif-tartismasi"
          ]
        },
        {
          "id": "hafta-cikis-kaniti",
          "phase": "kapanis",
          "deliveryRole": "core",
          "minutes": 4,
          "curriculumRefs": [
            "BTY.5.1.1.a",
            "BTY.5.1.1.b",
            "BTY.5.1.1.c"
          ],
          "teacherAction": "Kısa çıkış kontrolünü uygular ve yanlış anlaşılan noktaları not eder.",
          "studentAction": "Temel kavram, geçmiş-günümüz ilişkisi ve kullanım alanına göre sınıflandırmayla ilgili kısa sorulara cevap verir.",
          "resourceRefs": [
            "hizli-kontrol-player"
          ],
          "evidence": {
            "observable": "Öğrencinin haftanın üç süreç bileşenine ilişkin kısa cevapları görünür hâle gelir.",
            "mode": "quiz"
          }
        }
      ]
    }
  ]
}
```

Period toplamları:

- Period 1: `5 + 10 + 15 + 7 + 3 = 40 dk`
- Period 2: `4 + 10 + 8 + 10 + 4 + 4 = 40 dk`
- Hafta toplamı: `80 dk`

Bu dakika dağılımı KeskinLab öğretim senaryosu tasarımıdır; öğretim programının dakika dakika zorunlu resmi dağılımı olarak sunulmamalıdır.

---

## 12. Validator tasarımı

`validate-lesson-spec.mjs` ilk implementasyonda bağımsız bir quality gate olarak tasarlanacaktır.

Validator aşağıdaki kontrolleri yapmalıdır.

### 12.1 Yapısal bütünlük

- JSON parse edilebiliyor mu?
- Zorunlu üst alanlar var mı?
- `schemaVersion` desteklenen sürüm mü?
- `periodNo` değerleri pozitif integer mı?
- `plannedMinutes` pozitif integer mı?
- Step `minutes` değerleri pozitif integer mı?
- Her step geçerli bir `deliveryRole` (`core`, `optional`, `extension`) taşıyor mu?
- Step id’leri dosya içinde benzersiz mi?
- Resource id’leri benzersiz mi?

### 12.2 Canonical course/week doğrulaması

Validator `course` alanından canonical veri dosyasını kendi belirlemelidir.

Örnek mapping:

```text
5-sinif    → data/5-sinif.json
6-sinif    → data/6-sinif.json
robotik    → ilgili canonical robotik veri kaynağı
yapay-zeka → ilgili canonical yapay zekâ veri kaynağı
```

Spec’in keyfî `sourceRef.dataFile` yolu vermesine izin verilmez.

Kontroller:

- course canonical eşlemede var mı?
- week canonical course içinde var mı?
- `learningOutcomes` canonical haftayla uyumlu mu?

### 12.3 Süreç bileşeni kapsamı

Validator canonical hafta verisinden tam süreç referanslarını üretir.

Örnek:

```text
BTY.5.1.1.a
BTY.5.1.1.b
BTY.5.1.1.c
```

Sonra:

- canonical referansların tamamı en az bir `core` step’te kullanılmış mı?
- canonical kaynakta olmayan ref kullanılmış mı?
- aynı ref’in tekrar kullanılması normaldir; kapsama kontrolü set mantığıyla yapılır.

### 12.4 Period ve süre tutarlılığı

- Her period için `sum(coreSteps.minutes) === plannedMinutes` olmalı.
- Optional ve extension step süreleri `plannedMinutes` toplamına dahil edilmemeli.
- Haftalık toplam period süresi canonical `ders_saati` ile uyumlu olmalı.
- Period numaraları benzersiz ve mantıklı sırada olmalı.
- Schema period sayısını sınırlandırmaz; validator canonical haftaya göre beklenen yapıyı değerlendirir.

### 12.5 Step ilişki bütünlüğü

- `anchorStepId` ve `alternativeToStepId` aynı anda kullanılamaz.
- Core step bu iki ilişki alanından hiçbirini taşıyamaz.
- Extension step `anchorStepId` taşımak zorundadır.
- `anchorStepId` yalnız extension step’te kullanılabilir.
- `alternativeToStepId` yalnız optional step’te kullanılabilir.
- Her iki referans da aynı period içindeki geçerli bir core step’e çözülmelidir.
- Step referans grafiğinde cycle oluşamaz.

### 12.6 Resource referansları

- Step’te geçen her `resourceRef`, `resources` registry’de var mı?
- Kullanılmayan resource varsa başlangıçta warning verilebilir.
- Resource tipi tanınan bir resource türü mü?

### 12.7 Fiziksel materyal varlığı

`kind: "material"` kaynaklarında:

- `materyaller/{course}/hafta{NN}/{type}/` klasörü var mı?
- `indexes` dizi ise her index’in desteklenen uzantılardan en az biri var mı?
- `indexes: "all"` ise klasörde en az bir uygun materyal var mı?
- materyal sayısı için hiçbir üst sınır uygulanmaz.

### 12.8 Lesson Player doğrulaması

`kind: "lessonPlayer"` kaynaklarında:

- ilgili course/week Lesson Player verisi var mı?
- `activityId` gerçekten tanımlı mı?

### 12.9 Teknoloji fallback doğrulaması

- `requiresTechnology: true` ise `fallbackResourceRef` var mı?
- fallback gerçekten registry’de tanımlı mı?
- fallback kendi kendine işaret ediyor mu?
- fallback zincirinde cycle oluşuyor mu?
- fallback’in teknoloji gerektirmemesi tercih edilir; teknoloji gerektiriyorsa zincir sonunda gerçek düşük-teknoloji alternatifine ulaşılmalı.

### 12.10 Evidence doğrulaması

- Her periodün core rotasında en az bir anlamlı evidence var mı?
- `evidence.observable` boş mu?
- `evidence.mode` izinli değerlerden biri mi?
- `criterion` opsiyoneldir; uydurma nicel eşik üretmek zorunlu değildir.

### 12.11 Pedagojik sıra kontrolleri

`giris` ve `kapanis` schema’ya mekanik olarak zorlanmamalıdır; bazı haftalar farklı pedagojik desenler gerektirebilir.

Validator:

- ilk adım `giris` değilse warning,
- son adım `kapanis`/`degerlendirme` değilse warning,
- aynı period içinde anlamsız tekrar veya süre anomalileri varsa warning

üretebilir.

Bu kontroller error/warning ayrımıyla tasarlanmalıdır.

### 12.12 Migration strict mode

Normal modda:

- henüz spec oluşturulmamış hafta hata değildir.

`--strict` modda:

- canonical course haftasının lesson spec’i yoksa hata verilir.

Bu sayede migration kademeli yürütülür ve mevcut production CI erken aşamada kırılmaz.

---

## 13. Sayfa deneyimi için hedef kontrat

Renderer ileride spec-driven olduğunda öğretmenin gördüğü birincil navigasyon materyal türü değil, ders akışı olacaktır.

Örnek:

```text
HAFTA 01 · Bilişim Teknolojilerinin Sınıflandırılması
BTY.5.1.1 · 2 × 40 dk

[ 1. DERSİ BAŞLAT ]
Kavramları Keşfet ve Sınıflandır

[ 2. DERSİ BAŞLAT ]
Geçmişten Günümüze İlişkilendir ve Kanıtla
```

Öğretmen çekirdek rotayı başlattığında renderer yalnız `core` step’lerde ilerler. Bir core step’in bağlı seçenekleri varsa arayüz bağlama göre şunları sunabilir:

- `optional` için **Başka örnek seç**,
- `extension` için **Bu adımı genişlet**.

Seçilen optional adım core örneğin yerine çalışır; extension tamamlandıktan sonra akış bağlı olduğu core rotaya döner. Bu seçimler fiziksel görsel sırasına veya görsele gömülü toplam sayıya bağlanmaz.

Bir period açıldığında:

```text
01 · Ön bilgiyi yokla
02 · Kavramları kur
03 · Sınıflandır
04 · Tartış
05 · Kapanış
```

Sunum veya Lesson Player öğretmenin menüden seçtiği ayrı bir “materyal bölümü” olmaktan çıkar; ilgili adımın sınıf yüzeyi olur.

Öğretmen yine “Tüm Materyaller” veya “Öğretmen Masası” gibi yardımcı alanlara erişebilir. Ancak ana ders akışının omurgası bunlar değildir.

Yeni üretilecek statik görsellerde `XX/YY` biçiminde mutlak toplam yüzey sayısı bulunmaz. Yüzey sayısı pedagojik ihtiyaca ve seçilen rotaya göre değişebileceğinden ilerleme göstergesi gerekiyorsa renderer tarafından dinamik üretilir. Daha önce kilitlenmiş görsellerdeki mevcut sayaçlar bu karar nedeniyle yeniden üretilmez veya değiştirilmez.

---

## 14. Sabit olan ve değişken olan

### Sabit: pedagojik kontrat

Bir hafta hazır sayılmadan önce şu sorular cevaplanmalıdır:

- Öğretmen dersi nereden başlatıyor?
- Öğrenci hangi öğrenme eylemlerini yapıyor?
- Resmî öğrenme çıktılarının süreç bileşenleri nerede karşılanıyor?
- Öğrenme kanıtı nerede oluşuyor?
- Destekleme/zenginleştirme gerektiğinde ne yapılabiliyor?
- Teknoloji bağımlı adımların yedeği var mı?
- İkinci period bağımsız başlatılabiliyor mu?

### Değişken: materyal miktarı ve biçimi

Haftaya göre değişebilir:

- slayt sayısı,
- infografik sayısı,
- Lesson Player etkinliği sayısı,
- öğrenci çalışma kâğıdı sayısı,
- tartışma adımı sayısı,
- değerlendirme biçimi,
- period içindeki step sayısı,
- optional ve extension adımların sayısı,
- öğretmenin seçtiği alternatif örnek ve genişletmeler.

Bu nedenle “her hafta 10 slayt + 2 infografik + 1 etkinlik” gibi üretim standardı kullanılmayacaktır.

---

## 15. Migration planı

### Faz 1 — Mimari doküman

Bu belge oluşturulur ve birlikte gözden geçirilir.

Production dosyalarına dokunulmaz.

### Faz 2 — Schema ve Week 01 spec

Onay sonrası yalnız yeni dosyalar eklenir:

```text
lesson-specs/lesson-spec.schema.json
lesson-specs/5-sinif/hafta01.json
```

Mevcut renderer henüz değiştirilmez.

### Faz 3 — Validator

Yeni:

```text
scripts/validate-lesson-spec.mjs
```

oluşturulur.

Başlangıçta bağımsız script olarak çalışır; ana `validate` pipeline’ına hemen dahil edilmez.

### Faz 4 — İzole prototype renderer

Production sayfasından bağımsız bir preview ile:

- Week 01 spec okunur,
- iki ayrı period gösterilir,
- step sırası render edilir,
- resource’lar ilgili adımlara bağlanır,
- period bağımsız başlangıcı test edilir.

### Faz 5 — Week 01 içerik tamamlama

Storyboard üzerinden Week 01’in gerçekten ihtiyaç duyduğu tüm sınıf yüzeyleri belirlenir.

Eksikse:

- yeni sunum ekranları,
- ek karşılaştırma görselleri,
- sınıflandırma kartları,
- öğrenci materyalleri,
- değerlendirme yüzeyleri

üretilir.

Materyal sayısı lesson spec’in ihtiyaçlarından türetilir.

### Faz 6 — Production entegrasyonu

Prototype onaylandıktan sonra renderer:

- spec olan haftalarda spec-driven akış,
- spec olmayan haftalarda mevcut material-driven fallback

kullanacak şekilde kademeli değiştirilir.

### Faz 7 — Kademeli haftalık migration

Önce 5. sınıf Theme 1, ardından diğer haftalar ve diğer dersler lesson spec yapısına geçirilir.

### Faz 8 — Strict quality gate

Yeterli migration tamamlandığında `--strict` validator CI/build quality gate’e eklenebilir.

---

## 16. Production güvenlik ilkesi

Lesson-spec migration boyunca şu ilke korunur:

> Çalışan production sistemi, yeni mimari tamamen doğrulanmadan gereksiz yere yeniden yazılmaz.

Bu nedenle:

- yeni veri katmanı önce yanına eklenir,
- mevcut materyal sistemi korunur,
- prototype izole edilir,
- fallback davranışı tutulur,
- production geçişi ancak Week 01 üzerinde pedagojik ve teknik onaydan sonra yapılır.

---

## 17. KeskinLab lesson-spec için karar özeti

1. Temel sınıf birimi `period`dur.
2. İki ders saatlik hafta iki bağımsız 40 dakikalık period olarak modellenir.
3. Süreç bileşenleri tam kimlikle (`BTY.5.1.1.a`) referanslanır.
4. Pedagojik step’ler fiziksel materyal indexlerine doğrudan bağlanmaz; `resources` registry kullanır.
5. Materyal sayısına üst sınır konulmaz.
6. Teknoloji fallback’i yalnız teknoloji bağımlı resource’larda zorunludur.
7. Evidence yapılandırılmış bir öğrenme kanıtıdır.
8. Canonical veri kaynağını validator course alanından çözer.
9. `lesson-spec` sayfa dizilimi değil, öğretim senaryosudur.
10. Spec olmayan haftalar migration sürecinde mevcut sistemle çalışmaya devam eder.
11. Production renderer ancak prototype onayından sonra değiştirilir.
12. Bir hafta, öğretmen dışarıdan başka kaynağa ihtiyaç duymadan ilgili ders saatlerini yürütebildiğinde “hazır” kabul edilir.
13. Her step `core`, `optional` veya `extension` delivery rolü taşır; period süresi yalnız core adımlardan hesaplanır.
14. Yeni görseller mutlak toplam yüzey sayısını taşımaz; rota ilerlemesi renderer sorumluluğudur.

---

## 18. Bir sonraki onaydan sonra yapılacak iş

Bu mimari kilitlendikten sonra ilk gerçek implementasyon paketi şu üç dosyayla sınırlandırılmalıdır:

```text
lesson-specs/lesson-spec.schema.json
lesson-specs/5-sinif/hafta01.json
scripts/validate-lesson-spec.mjs
```

Bu aşamada bile production renderer’a dokunulmayacaktır.

Amaç önce veri kontratının gerçekten çalıştığını kanıtlamak, sonra arayüzü bu kontrata bağlamaktır.
