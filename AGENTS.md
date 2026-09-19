# KeskinLab Agent Working Agreement

This repository is developed for KeskinLab, a teacher-oriented middle-school learning and teaching workspace.

The primary goal of this file is to reduce the project owner's screen time. The project owner should make product, pedagogical, and visual decisions—not operate the agent step by step.

## 1. Core operating principle

Work autonomously on bounded, low-risk implementation tasks. Ask the user only when a real product, pedagogical, visual, destructive, or architectural decision is required.

Do not turn the user into an operator.

Preferred workflow:

1. Understand the requested outcome.
2. Inspect the relevant repository files and sources.
3. Make a bounded plan internally.
4. Implement the task.
5. Run targeted validation/tests.
6. Fix problems you can safely resolve yourself.
7. Present the completed result for approval.

Avoid repeated micro-questions when the repository or existing approved design already answers them.

## 2. Three classes of work

### A. Autonomous work

Proceed without asking for intermediate approval when the requested outcome is clear and the change is low risk.

Examples:
- repository/file discovery
- documentation reading
- asset path checks
- PNG/WebP conversion without visual alteration
- broken-link checks
- targeted tests
- console/log inspection
- spelling corrections
- applying already-approved design tokens
- small responsive fixes that preserve the approved design
- wiring already-approved assets into already-approved UI
- mechanical edits with an obvious intended result

For these tasks: implement, verify, then report.

### B. Controlled production

Complete the work and prepare it for review, but do not publish or make irreversible changes without approval.

Examples:
- a new page
- a new major section
- a new course/week layout
- a carousel or other meaningful interaction
- significant responsive/layout work
- a substantial visual implementation

For these tasks: build the complete preview, validate it, then ask for approval on the result—not on every intermediate step.

### C. Critical decisions

Stop and ask before proceeding when the task requires a genuine decision the repository cannot safely resolve.

Examples:
- conflicts between official educational sources
- changes that depart from an approved Golden Master
- pedagogical scope changes
- destructive file/data operations
- production/main branch changes
- major architecture or dependency changes
- security-sensitive work
- replacing a working system with a new architecture

When asking, do the investigation first. Present the options, consequences, and a recommendation.

## 3. KeskinLab product rules

KeskinLab is not a generic SaaS dashboard and not a custom media-engine project. It is a practical teacher workspace that turns official curriculum into usable weekly classroom experiences.

Priority courses:
- 5. Sınıf Bilişim Teknolojileri ve Yazılım
- 6. Sınıf Bilişim Teknolojileri ve Yazılım

Elective courses:
- Robotik Kodlama
- Yapay Zekâ Uygulamaları

A teacher opening a course/week should be able to reach the relevant lesson plan, official curriculum scope, classroom teaching scenario, slides/materials, activities when pedagogically justified, assessment tools, documents, digital resources, official MEB resources, and school-year calendar.

Do not invent curriculum scope or teaching outcomes.

## 4. Source hierarchy

When educational sources conflict, do not silently reconcile them. Use this hierarchy and surface genuine conflicts to the user:

1. TYMM Bilişim Teknolojileri ve Yazılım Öğretim Programı
2. İlgili sınıfın Öğretmen Kılavuz Kitabı
3. Yıllık/haftalık plan, yalnız zamanlama için
4. KeskinLab pedagojik yorumu

TYMM Ortak Metni; çapraz beceri, değer, ölçme ve farklılaştırma çerçevesi olarak kullanılabilir. Öğretim Programının veya ilgili sınıfın Öğretmen Kılavuz Kitabının önüne geçemez.

`data/5-sinif.json` bağımsız bir pedagojik veya resmî kaynak değildir. Takvim bilgisini ve uygulamada gösterilen haftalık kapsamı besleyen kanonik uygulama verisidir. Tamamlanmış haftalarda `data/5-sinif-content-state.json` içindeki fiilî kapsamı doğru yansıtmalıdır; gelecek haftalarda ise yalnız resmî kaynak sentezinden sonra güncellenebilir. Türetilmiş JSON, üretilmiş uygulama verisi ve arayüz metni resmî kaynakların ya da tamamlanmış materyallerdeki gerçek pedagojik sınırın yerine geçemez.

### 4.1. 5. sınıf içerik sürekliliği

5. sınıfta yeni bir hafta hazırlamadan önce `data/5-sinif-content-state.json` okunmalıdır. Bu dosya, tamamlanmış haftaların gerçek pedagojik kapsamı ve bir sonraki başlangıç noktası için repo içindeki kanonik süreklilik kaydıdır.

- Bir sonraki hafta hazırlanırken önce tamamlanmış önceki haftaların gerçekte hangi öğrenme çıktısı ve süreç bileşenlerini işlediği kontrol edilir.
- Haftanın numarası tek başına içerik başlangıcını belirlemez.
- Eski haftalık JSON, eski slayt sayısı veya legacy materyal yeni üretime kaynak olamaz.
- Resmî kaynaklar yukarıdaki sırayla sentezlenmeden ve önceki haftanın bitiş noktası süreklilik kaydından belirlenmeden yeni hafta üretilemez.
- Süreklilik kaydı ile güncel materyal arasında çelişki bulunursa içerik tahmin edilmez veya sessizce uzlaştırılmaz; üretim durdurulur ve çelişki kullanıcıya raporlanır.
- Süreklilik kaydında tamamlanmış hafta olarak yer almayan mevcut bir materyal klasörü, slayt paketi veya günlük plan kendiliğinden güncel ya da onaylı kabul edilemez; resmî kaynaklar ve kayıtlı bitiş noktasıyla yeniden doğrulanmadan kullanılamaz.
- `keskinlab-5-sinif-hafta-plani-2026-2027.json`, günlük plan DOCX'leri, `course-data-5-sinif.js` ve `generated/` altındaki çıktılar pedagojik başlangıç noktası belirlemek için kanonik kaynak değildir.

## 5. Visual and design rules

The user-approved Golden Master is the target design, not inspiration or a moodboard.

Therefore:
- do not reinterpret an approved design without being asked
- do not simplify approved details merely to make the UI "cleaner"
- do not remove environmental writing/details from approved imagery
- do not add new art direction when the Golden Master already answers the question
- do not replace approved assets with new variants
- do not change colors, typography, spacing, section order, or composition unless the task requires it
- preserve approved details exactly when implementing them

Current locked design direction uses:
- near-white / warm-neutral backgrounds
- charcoal/black typography
- burgundy/dark-red accent
- IBM Plex Sans as primary typeface
- restrained borders/radius
- calm UI with more character inside learning materials and imagery

Avoid generic SaaS styling, neon/cyber aesthetics, glassmorphism, gradient-heavy styling, circuit-overload motifs, and unnecessary visual clutter.

## 6. Approval discipline

Never describe a design, page, or asset as "locked", "final", or "approved" unless the user explicitly approved it.

Do not advance to the next design surface merely because the current one is technically complete. If the user wants to review one example at a time, respect that sequence.

Do not revive parked/rejected prototypes unless explicitly asked.

## 7. Repository safety

Default working branch for the current redesign:

`keskinlab-redesign-2026`

Do not modify `main` unless the user explicitly requests it.

Do not create test branches, temporary branches, dummy files, or meaningless commits just to test permissions.

Do not delete files or clean legacy artifacts unless deletion/cleanup is explicitly requested and the impact is understood.

Do not rewrite a working system unnecessarily.

Do not introduce new frameworks or infrastructure unless the task genuinely requires them and the user approves the architectural change.

## 8. Existing implementation character

The project is a vanilla multipage HTML/CSS/JS site with generated/derived data and validation scripts. Preserve that architecture unless there is a strong approved reason to change it.

Prefer existing canonical course surfaces and reusable repository data over creating parallel custom systems.

Do not revive the previous custom week-engine/media-player approach unless explicitly requested.

## 9. Error handling

If something fails:

1. inspect the relevant logs/error output
2. identify the likely cause
3. inspect the smallest relevant file set
4. apply a safe fix if the intent is clear
5. run a targeted verification
6. only ask the user if the remaining problem requires a real decision or missing information

Do not respond to ordinary implementation failures with "what should I do?" before performing reasonable diagnosis.

## 10. Testing and efficiency

Prefer targeted checks over broad expensive work.

- run only the tests relevant to the changed surface first
- do not repeatedly scan the whole repository when a narrow search is sufficient
- do not repeat work already completed and verified
- keep context passed to delegated workers minimal and task-specific
- avoid unnecessary parallelism
- do not let delegated workers broaden scope

## 11. Delegation policy

When multiple agent/model roles are available, reserve the strongest reasoning model for work that benefits from it.

Suitable for bounded workers:
- repository search
- documentation reading
- file discovery
- log inspection
- targeted tests
- repetitive mechanical edits
- simple extraction/transformation

Keep on the primary reasoning agent:
- architecture
- ambiguous product decisions
- difficult debugging
- source conflicts
- security-sensitive changes
- scope decisions
- final integration review

Delegation exists to reduce cost and user supervision, not to multiply agents unnecessarily.

## 12. Final report format

After a meaningful task, report compactly:

**Done**
- what was completed

**Changed**
- files changed

**Checked**
- targeted tests/validation performed

**Need from you**
- only the decision or approval that genuinely remains

Do not dump long internal logs or implementation diaries unless the user asks for them.

## 13. Success criterion

A successful KeskinLab workflow is not only one where the site improves. It is one where the project owner spends less time supervising routine execution.

Optimize for completed, verified work with fewer interruptions.

## KeskinLab Codex Talimatları

### Yayın ve Hosting Politikası

Bu proje ChatGPT Sites / OpenAI Sites kullanmaz.

KeskinLab yalnızca mevcut GitHub + Cloudflare Pages altyapısı üzerinden yayınlanır.

KeskinLab'ın tek production hattı:

`GitHub origin/main` → `Cloudflare Pages projesi keskinlab`

YASAK:

- ChatGPT Sites kullanmak
- `sites:sites-hosting` entegrasyonunu çağırmak
- `sites.save_site_version` veya başka bir Sites hosting çağrısı yapmak
- Wrangler ile production deploy yapmak
- `.openai/hosting.json` oluşturmak veya değiştirmek
- Yeni hosting/deployment mimarisi kurmak
- Sites deployment oluşturmak
- Mevcut Cloudflare akışını başka bir hosting sistemiyle değiştirmek

Bir görevde "deploy", "publish", "yayınla", "siteye ekle", "canlıya al" gibi ifadeler geçerse:

1. Önce mevcut KeskinLab GitHub/Cloudflare yayın yapısını kullan.
2. ChatGPT Sites'a geçme.
3. Yeni hosting yapılandırması oluşturma.
4. Alternatif hosting arama, önerme veya kurma.
5. Aktif branch `main` değilse production işlemi öncesinde mevcut branch ile `main` arasındaki ilişkiyi kontrol et ve kullanıcıya bildir.
6. Development branch'inden doğrudan başka bir hosting sistemine production yayını yapma.

Cloudflare Pages proje ayarlarını, dashboard'u, domain'i veya build/deploy konfigürasyonunu kullanıcı açıkça istemedikçe değiştirme.

Mevcut çalışan yayın altyapısını bir görev bahanesiyle yeniden tasarlama.

### Branch Politikası

Aktif geliştirme branch'i: `keskinlab-redesign-2026`

Branch, merge, cherry-pick, rebase veya main'e taşıma işlemlerini kullanıcı açıkça istemedikçe yapma.

Mevcut görev yalnız içerik entegrasyonuysa repo mimarisini veya deployment mimarisini değiştirme.

### Kredi / İşlem Tasarrufu

Zaten başarıyla yapılmış build, validation veya smoke testleri gereksiz yere tekrar çalıştırma.

Yalnız görevin doğruluğu için gerçekten gerekli kontrolleri çalıştır.

Aynı içeriği yeniden üretme.

Kullanıcı açıkça istemedikçe deploy/publish yapma.
