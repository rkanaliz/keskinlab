const stages = [
  {
    id: "identity",
    kicker: "01 · Dijital dünyadaki temsilin",
    title: "Dijital Kimlik",
    items: [
      { id: "identity-definition", bucket: "definition", text: "Çevrim içi ortamlarda kişiyi temsil eden profil ve niteliklerin bütünü" },
      { id: "identity-feature-1", bucket: "features", text: "Gizlilik ayarlarıyla görünürlük yönetilebilir" },
      { id: "identity-feature-2", bucket: "features", text: "Kullanıcı adı, avatar ve profil bilgileri bir araya gelir" },
      { id: "identity-example-1", bucket: "examples", text: "Okul platformunda oluşturulan öğrenci profili" },
      { id: "identity-example-2", bucket: "examples", text: "Sosyal medyadaki doğrulanmış hesap rozeti" },
      { id: "identity-nonexample-1", bucket: "nonexamples", text: "Bilgisayar kasasının donanım özellikleri" },
      { id: "identity-nonexample-2", bucket: "nonexamples", text: "Bir kişinin fiziksel nüfus cüzdanının kendisi" }
    ]
  },
  {
    id: "footprint",
    kicker: "02 · İnternette bıraktığın izler",
    title: "Dijital Ayak İzi",
    items: [
      { id: "footprint-definition", bucket: "definition", text: "İnternette bırakılan izler: ziyaretler, paylaşımlar ve beğeniler" },
      { id: "footprint-feature-1", bucket: "features", text: "Pasif (çerezler, kayıtlar) ve aktif (paylaşım) olabilir" },
      { id: "footprint-feature-2", bucket: "features", text: "Kalıcı olabilir ve başkalarınca arşivlenebilir" },
      { id: "footprint-example-1", bucket: "examples", text: "Bir siteden çıkış yaptıktan sonra bile kalan çerez kaydı" },
      { id: "footprint-example-2", bucket: "examples", text: "Eski bir paylaşımın arama sonuçlarında görünmesi" },
      { id: "footprint-nonexample-1", bucket: "nonexamples", text: "USB bellekteki silinmiş dosyayı geri getirme yazılımı" },
      { id: "footprint-nonexample-2", bucket: "nonexamples", text: "Bilgisayar kasasına yapıştırılan garanti etiketi" }
    ]
  },
  {
    id: "citizenship",
    kicker: "03 · Güvenli, etik ve sorumlu kullanım",
    title: "Dijital Vatandaşlık",
    items: [
      { id: "citizenship-definition", bucket: "definition", text: "Dijital ortamları güvenli, etik ve hukuka uygun kullanma sorumluluğu" },
      { id: "citizenship-feature-1", bucket: "features", text: "Kaynak gösterme ve telif haklarına uyma" },
      { id: "citizenship-feature-2", bucket: "features", text: "Saygılı iletişim kurma ve nefret söyleminden kaçınma" },
      { id: "citizenship-example-1", bucket: "examples", text: "Topluluk kurallarına uygun yorum yazma" },
      { id: "citizenship-example-2", bucket: "examples", text: "Güçlü parola oluşturup çok faktörlü doğrulama kullanma" },
      { id: "citizenship-nonexample-1", bucket: "nonexamples", text: "Başkasının hesabına izinsiz girme denemesi" },
      { id: "citizenship-nonexample-2", bucket: "nonexamples", text: "Telifli içeriği izinsiz kopyalayıp paylaşma" }
    ]
  }
];

const bucketLimits = { definition: 1, features: 2, examples: 2, nonexamples: 2 };
const activity = document.querySelector(".activity");
const stageKicker = document.querySelector("#stageKicker");
const stageTitle = document.querySelector("#stageTitle");
const remainingCount = document.querySelector("#remainingCount");
const statusMessage = document.querySelector("#statusMessage");
const cardsElement = document.querySelector("#cards");
const shuffleButton = document.querySelector("#shuffleButton");
const restartButton = document.querySelector("#restartButton");
const completionDialog = document.querySelector("#completionDialog");
const playAgainButton = document.querySelector("#playAgainButton");
const closeDialogButton = document.querySelector("#closeDialogButton");
const stageTabs = [...document.querySelectorAll("[data-stage-tab]")];
const buckets = [...document.querySelectorAll(".bucket")];

let activeIndex = 0;
let completedStages = new Set();
let placedByStage = new Map(stages.map((stage) => [stage.id, new Map()]));
let orderByStage = new Map(stages.map((stage) => [stage.id, stage.items.map((item) => item.id)]));
let selectedItemId = null;

function activeStage() {
  return stages[activeIndex];
}

function itemById(itemId) {
  return activeStage().items.find((item) => item.id === itemId);
}

function createCard(item) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.draggable = true;
  card.dataset.itemId = item.id;
  card.textContent = item.text;
  card.setAttribute("aria-pressed", String(item.id === selectedItemId));
  if (item.id === selectedItemId) card.classList.add("is-selected");
  card.addEventListener("click", () => selectItem(item.id));
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);
  return card;
}

function renderStage() {
  const stage = activeStage();
  const placements = placedByStage.get(stage.id);
  activity.dataset.theme = stage.id;
  stageKicker.textContent = stage.kicker;
  stageTitle.textContent = stage.title;
  selectedItemId = null;

  buckets.forEach((bucket) => {
    const bucketName = bucket.dataset.bucket;
    const placedItems = stage.items.filter((item) => placements.get(item.id) === bucketName);
    const target = bucket.querySelector(".drop-zone");
    const list = bucket.querySelector(".placed-items");
    list.innerHTML = "";
    placedItems.forEach((item) => {
      const placed = document.createElement("div");
      placed.className = "placed-card";
      placed.textContent = item.text;
      list.append(placed);
    });
    target.classList.toggle("has-items", placedItems.length > 0);
    bucket.querySelector(".bucket-count").textContent = `${placedItems.length}/${bucketLimits[bucketName]}`;
  });

  const remainingItems = orderByStage.get(stage.id)
    .map((itemId) => stage.items.find((item) => item.id === itemId))
    .filter((item) => !placements.has(item.id));
  cardsElement.innerHTML = "";
  remainingItems.forEach((item) => cardsElement.append(createCard(item)));
  remainingCount.textContent = String(remainingItems.length);
  updateTabs();
  setStatus(remainingItems.length ? "Bir kart seç veya sürükle." : "Bu kavram tamamlandı.", remainingItems.length ? "" : "success");
}

function updateTabs() {
  stageTabs.forEach((tab, index) => {
    const complete = completedStages.has(stages[index].id);
    const unlocked = index === 0 || completedStages.has(stages[index - 1].id);
    tab.disabled = !unlocked;
    tab.classList.toggle("is-active", index === activeIndex);
    tab.classList.toggle("is-complete", complete);
    tab.toggleAttribute("aria-current", index === activeIndex);
    tab.querySelector("small").textContent = complete ? "Tamamlandı" : unlocked ? "Kilidi aç" : "Kilitli";
  });
}

function selectItem(itemId) {
  selectedItemId = selectedItemId === itemId ? null : itemId;
  renderCardsOnly();
  setStatus(selectedItemId ? "Kart seçildi. Şimdi uygun bölüme dokun." : "Kart seçimi kaldırıldı.", "");
}

function renderCardsOnly() {
  const stage = activeStage();
  const placements = placedByStage.get(stage.id);
  const remainingItems = orderByStage.get(stage.id)
    .map((itemId) => stage.items.find((item) => item.id === itemId))
    .filter((item) => !placements.has(item.id));
  cardsElement.innerHTML = "";
  remainingItems.forEach((item) => cardsElement.append(createCard(item)));
}

function placeItem(bucketName, itemId = selectedItemId) {
  if (!itemId) {
    setStatus("Önce bir kart seç.", "error");
    return;
  }

  const item = itemById(itemId);
  const target = document.querySelector(`[data-bucket="${bucketName}"] .drop-zone`);
  if (!item || item.bucket !== bucketName) {
    target.classList.remove("is-wrong");
    void target.offsetWidth;
    target.classList.add("is-wrong");
    selectedItemId = null;
    renderCardsOnly();
    setStatus("Bu öğe bu bölüme ait değil. Kart yerine geri döndü.", "error");
    return;
  }

  placedByStage.get(activeStage().id).set(itemId, bucketName);
  selectedItemId = null;
  renderStage();
  const placements = placedByStage.get(activeStage().id);
  if (placements.size === activeStage().items.length) finishStage();
  else setStatus("Doğru eşleştirme.", "success");
}

function finishStage() {
  const completedId = activeStage().id;
  completedStages.add(completedId);
  updateTabs();

  if (activeIndex < stages.length - 1) {
    activeIndex += 1;
    renderStage();
    setStatus(`${stages[activeIndex - 1].title} tamamlandı. Sıradaki kavram açıldı.`, "success");
  } else {
    setStatus("Üç kavram da tamamlandı.", "success");
    completionDialog.hidden = false;
    playAgainButton.focus();
  }
}

function shuffleRemaining() {
  const stage = activeStage();
  const placements = placedByStage.get(stage.id);
  const placed = orderByStage.get(stage.id).filter((itemId) => placements.has(itemId));
  const remaining = orderByStage.get(stage.id).filter((itemId) => !placements.has(itemId));
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [remaining[index], remaining[randomIndex]] = [remaining[randomIndex], remaining[index]];
  }
  orderByStage.set(stage.id, [...placed, ...remaining]);
  selectedItemId = null;
  renderCardsOnly();
  setStatus("Kalan kartlar karıştırıldı.", "");
}

function restart() {
  activeIndex = 0;
  completedStages = new Set();
  placedByStage = new Map(stages.map((stage) => [stage.id, new Map()]));
  orderByStage = new Map(stages.map((stage) => [stage.id, stage.items.map((item) => item.id)]));
  selectedItemId = null;
  completionDialog.hidden = true;
  renderStage();
}

function handleDragStart(event) {
  selectedItemId = event.currentTarget.dataset.itemId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", selectedItemId);
  requestAnimationFrame(() => event.currentTarget.classList.add("is-dragging"));
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("is-dragging");
  document.querySelectorAll(".drop-zone").forEach((zone) => zone.classList.remove("is-dragover"));
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
}

buckets.forEach((bucket) => {
  const target = bucket.querySelector(".drop-zone");
  const bucketName = bucket.dataset.bucket;
  target.addEventListener("click", () => placeItem(bucketName));
  target.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      placeItem(bucketName);
    }
  });
  target.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    target.classList.add("is-dragover");
  });
  target.addEventListener("dragleave", () => target.classList.remove("is-dragover"));
  target.addEventListener("drop", (event) => {
    event.preventDefault();
    target.classList.remove("is-dragover");
    placeItem(bucketName, event.dataTransfer.getData("text/plain"));
  });
});

stageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    if (tab.disabled) return;
    activeIndex = index;
    renderStage();
  });
});

shuffleButton.addEventListener("click", shuffleRemaining);
restartButton.addEventListener("click", restart);
playAgainButton.addEventListener("click", restart);
closeDialogButton.addEventListener("click", () => {
  completionDialog.hidden = true;
  restartButton.focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !completionDialog.hidden) closeDialogButton.click();
});

renderStage();
