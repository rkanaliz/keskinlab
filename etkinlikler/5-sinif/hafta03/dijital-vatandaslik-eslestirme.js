const cards = [
  { id: "edu-1", category: "education", text: "EBA hesabını yalnız kendi şifrenle kullanmak" },
  { id: "social-1", category: "social", text: "Bir haberi paylaşmadan önce farklı kaynaklardan doğrulamak" },
  { id: "health-1", category: "health", text: "E-Nabız sonuçlarını güvenli bağlantıdan görüntülemek" },
  { id: "public-1", category: "public", text: "E-Devlet için güçlü ve benzersiz parola kullanmak" },
  { id: "edu-2", category: "education", text: "Çevrim içi derste söz alarak ve saygılı konuşmak" },
  { id: "health-2", category: "health", text: "Sağlık bilgilerini yalnız yetkili kişilerle paylaşmak" },
  { id: "social-2", category: "social", text: "Başkasının fotoğrafını izin almadan paylaşmamak" },
  { id: "public-2", category: "public", text: "Belediyenin e-hizmetini resmî adresinden açmak" },
  { id: "health-3", category: "health", text: "İnternetteki sağlık önerisini uzman kaynaktan doğrulamak" },
  { id: "edu-3", category: "education", text: "Ödevde kullandığın görselin kaynağını belirtmek" },
  { id: "public-3", category: "public", text: "Çevrim içi işlemi ortak cihazda açık bırakmamak" },
  { id: "social-3", category: "social", text: "Siber zorbalığı güvendiğin bir yetişkine bildirmek" }
];

const cardsGrid = document.querySelector("#cardsGrid");
const matchCount = document.querySelector("#matchCount");
const totalCount = document.querySelector("#totalCount");
const statusMessage = document.querySelector("#statusMessage");
const selectionHint = document.querySelector("#selectionHint");
const resetButton = document.querySelector("#resetButton");
const checkButton = document.querySelector("#checkButton");
const completion = document.querySelector("#completion");
const helpButton = document.querySelector("#helpButton");
const instructions = document.querySelector("#instructions");
const categoryElements = [...document.querySelectorAll(".category")];

let selectedCardId = null;
let assignments = new Map();
let resultsVisible = false;

function createCardButton(card, placed = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = placed ? "placed-card" : "card";
  button.draggable = true;
  button.dataset.cardId = card.id;
  button.textContent = card.text;
  button.setAttribute("aria-pressed", String(card.id === selectedCardId));
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    selectCard(card.id);
  });
  button.addEventListener("dragstart", handleDragStart);
  button.addEventListener("dragend", handleDragEnd);

  if (card.id === selectedCardId) button.classList.add("is-selected");
  if (placed && resultsVisible) {
    button.classList.add(assignments.get(card.id) === card.category ? "is-correct" : "is-wrong");
  }
  return button;
}

function render() {
  cardsGrid.innerHTML = "";
  cards.filter((card) => !assignments.has(card.id)).forEach((card) => {
    cardsGrid.append(createCardButton(card));
  });

  categoryElements.forEach((categoryElement) => {
    const categoryName = categoryElement.dataset.category;
    const assignedCards = cards.filter((card) => assignments.get(card.id) === categoryName);
    const list = categoryElement.querySelector(".matched-list");
    list.innerHTML = "";
    assignedCards.forEach((card) => list.append(createCardButton(card, true)));
    categoryElement.querySelector(".category-count").textContent = `${assignedCards.length} kart`;
    categoryElement.classList.remove("has-correct", "has-wrong");

    const oldResult = categoryElement.querySelector(".category-result");
    if (oldResult) oldResult.remove();

    if (resultsVisible && assignedCards.length) {
      const correctCount = assignedCards.filter((card) => card.category === categoryName).length;
      const wrongCount = assignedCards.length - correctCount;
      categoryElement.classList.add(wrongCount ? "has-wrong" : "has-correct");
      const result = document.createElement("span");
      result.className = "category-result";
      result.textContent = `${correctCount} doğru${wrongCount ? ` · ${wrongCount} yanlış` : ""}`;
      list.before(result);
    }
  });

  matchCount.textContent = String(assignments.size);
  checkButton.disabled = assignments.size !== cards.length;
  selectionHint.textContent = assignments.size === cards.length
    ? "Tüm kartlar yerleşti. Şimdi kontrol edebilirsin."
    : selectedCardId
      ? "Şimdi bir alan seç."
      : "Önce bir kart seç.";
}

function selectCard(cardId) {
  selectedCardId = selectedCardId === cardId ? null : cardId;
  render();
  setStatus(selectedCardId
    ? "Kart seçildi. Şimdi yerleştirmek istediğin alana dokun."
    : "Kart seçimi kaldırıldı.", "");
}

function placeCard(categoryName, cardId = selectedCardId) {
  if (!cardId) {
    setStatus("Önce bir kart seç.", "error");
    return;
  }

  assignments.set(cardId, categoryName);
  selectedCardId = null;
  resultsVisible = false;
  completion.hidden = true;
  render();
  setStatus("Kart yerleştirildi. Kontrol etmeden önce kartların yerini değiştirebilirsin.", "");
}

function handleDragStart(event) {
  selectedCardId = event.currentTarget.dataset.cardId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", selectedCardId);
  requestAnimationFrame(() => event.currentTarget.classList.add("is-dragging"));
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("is-dragging");
  categoryElements.forEach((category) => category.classList.remove("is-dragover"));
}

function checkAnswers() {
  if (assignments.size !== cards.length) {
    setStatus("Kontrol etmeden önce bütün kartları yerleştir.", "error");
    return;
  }

  resultsVisible = true;
  selectedCardId = null;
  const correctCount = cards.filter((card) => assignments.get(card.id) === card.category).length;
  render();

  if (correctCount === cards.length) {
    completion.hidden = false;
    setStatus("Tebrikler, bütün eşleşmeler doğru!", "success");
    completion.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    completion.hidden = true;
    setStatus(`${correctCount} doğru, ${cards.length - correctCount} yanlış. Kırmızı kartları başka bir alana taşı.`, "error");
  }
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
}

function resetGame() {
  assignments = new Map();
  selectedCardId = null;
  resultsVisible = false;
  completion.hidden = true;
  setStatus("Bir kart seç veya sürükle.", "");
  render();
}

categoryElements.forEach((category) => {
  category.addEventListener("click", () => placeCard(category.dataset.category));
  category.addEventListener("keydown", (event) => {
    if (event.target !== category) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      placeCard(category.dataset.category);
    }
  });
  category.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    category.classList.add("is-dragover");
  });
  category.addEventListener("dragleave", () => category.classList.remove("is-dragover"));
  category.addEventListener("drop", (event) => {
    event.preventDefault();
    category.classList.remove("is-dragover");
    placeCard(category.dataset.category, event.dataTransfer.getData("text/plain"));
  });
});

helpButton.addEventListener("click", () => {
  const isOpen = helpButton.getAttribute("aria-expanded") === "true";
  helpButton.setAttribute("aria-expanded", String(!isOpen));
  instructions.hidden = isOpen;
});

checkButton.addEventListener("click", checkAnswers);
resetButton.addEventListener("click", resetGame);
totalCount.textContent = String(cards.length);
render();
