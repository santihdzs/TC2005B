let isEnglish = false;
let isDarkMode = false;

const textES = {
  brandTagline: "Cat café cerca del Tec: café rico, gatos lindos",
  introTitle: "Tu pausa favorita entre clases",
  introText:
    "En GatoTec Café puedes estudiar, relajarte y convivir con gatos rescatados mientras tomas un latte. Ambiente tranquilo y mesas cómodas.",
  menuTitle: "Menú",
  menuSubtitle: "Tres favoritos.",
  item1Name: "Latte “Michi”",
  item1Desc: "Cremoso + canela.",
  item2Name: "Chai Ronroneo",
  item2Desc: "Calientito y especiado.",
  item3Name: "Galleta Patita",
  item3Desc: "Avena + chocolate.",
  rulesTitle: "Reglas con los gatos",
  rulesSubtitle: "Para que todos estén a gusto.",
  rule1: "No cargar gatos sin permiso.",
  rule2: "No flash en fotos.",
  rule3: "Si el gato se va, lo dejas ir.",
  noticeTitle: "Tip:",
  noticeText: "Lávate las manos antes y después de jugar."
};

const textEN = {
  brandTagline: "Cat café near Tec: great coffee, even better cats",
  introTitle: "Your favorite break between classes",
  introText:
    "At GatoTec Café you can study, relax, and hang out with rescued cats while sipping a latte. Calm vibes and comfy tables.",
  menuTitle: "Menu",
  menuSubtitle: "Three favorites.",
  item1Name: "“Michi” Latte",
  item1Desc: "Creamy + cinnamon.",
  item2Name: "Purring Chai",
  item2Desc: "Warm and spiced.",
  item3Name: "Paw Cookie",
  item3Desc: "Oats + chocolate.",
  rulesTitle: "Rules with the cats",
  rulesSubtitle: "So everyone stays comfy.",
  rule1: "Don’t pick up cats without permission.",
  rule2: "No flash photos.",
  rule3: "If a cat walks away, let them.",
  noticeTitle: "Tip:",
  noticeText: "Wash your hands before and after playing."
};

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

function toggleLanguage() {
  var t;
  isEnglish = !isEnglish;

  if (isEnglish) {
    t = textEN;
  } else {
    t = textES;
  }

  setText("brandTagline", t.brandTagline);
  setText("introTitle", t.introTitle);
  setText("introText", t.introText);

  setText("menuTitle", t.menuTitle);
  setText("menuSubtitle", t.menuSubtitle);
  setText("item1Name", t.item1Name);
  setText("item1Desc", t.item1Desc);
  setText("item2Name", t.item2Name);
  setText("item2Desc", t.item2Desc);
  setText("item3Name", t.item3Name);
  setText("item3Desc", t.item3Desc);

  setText("rulesTitle", t.rulesTitle);
  setText("rulesSubtitle", t.rulesSubtitle);
  setText("rule1", t.rule1);
  setText("rule2", t.rule2);
  setText("rule3", t.rule3);
  setText("noticeTitle", t.noticeTitle);
  setText("noticeText", t.noticeText);

  if (isEnglish) {
    document.documentElement.lang = "en";
    var langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.textContent = "ES";
  } else {
    document.documentElement.lang = "es";
    var langBtn2 = document.getElementById("langBtn");
    if (langBtn2) langBtn2.textContent = "EN";
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode;

  var themeBtn = document.getElementById("themeBtn");

  if (isDarkMode) {
    document.body.classList.remove("theme-light");
    document.body.classList.add("theme-dark");
    if (themeBtn) themeBtn.textContent = "Modo claro";
  } else {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
    if (themeBtn) themeBtn.textContent = "Modo oscuro";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var langBtn = document.getElementById("langBtn");
  if (langBtn) {
    langBtn.addEventListener("click", toggleLanguage);
  }

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }
});