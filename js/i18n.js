/**
 * TỪ ĐIỂN SONG NGỮ / I18N DICTIONARY
 * Thêm khoá mới ở cả hai ngôn ngữ nếu cần thêm chữ mới lên giao diện.
 */

const I18N = {
  vi: {
    siteTitle: "Hành trình của Lucky",
    navMap: "Bản đồ",
    navAlbum: "Album",
    navAbout: "Về mình",
    tripListTitle: "Các chuyến đi",
    photosCount: "ảnh",
    albumPlaceholderTitle: "Chọn một chuyến đi",
    albumPlaceholderText: "Bấm vào một ghim trên bản đồ hoặc một thẻ bên trái để xem album ảnh.",
    aboutTitle: "Về mình",
    aboutText:
      "Xin chào, mình là Lucky. Đây là nơi mình lưu lại những chuyến đi, những bức ảnh và câu chuyện nhỏ trên đường. Cảm ơn bạn đã ghé thăm hành trình của mình!",
    footerText: "Hành trình của Lucky",
    clusterHint: "Thu nhỏ bản đồ để xem các điểm gần nhau gộp lại",
  },
  fr: {
    siteTitle: "Le voyage de Lucky",
    navMap: "Carte",
    navAlbum: "Album",
    navAbout: "À propos",
    tripListTitle: "Les voyages",
    photosCount: "photos",
    albumPlaceholderTitle: "Choisissez un voyage",
    albumPlaceholderText:
      "Cliquez sur un repère sur la carte ou sur une carte à gauche pour voir l'album photo.",
    aboutTitle: "À propos de moi",
    aboutText:
      "Bonjour, je suis Lucky. C'est ici que je garde mes voyages, mes photos et de petites histoires en chemin. Merci de votre visite !",
    footerText: "Le voyage de Lucky",
    clusterHint: "Dézoomez la carte pour regrouper les points proches",
  },
};

const LANG_STORAGE_KEY = "lucky-voyages-lang";

function getStoredLanguage() {
  return localStorage.getItem(LANG_STORAGE_KEY) || "vi";
}

function setStoredLanguage(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

function translate(key, lang) {
  return (I18N[lang] && I18N[lang][key]) || I18N.vi[key] || key;
}

function applyLanguage(lang) {
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translate(key, lang);
  });
  document.querySelectorAll(".lang-vi").forEach((el) => el.classList.toggle("active", lang === "vi"));
  document.querySelectorAll(".lang-fr").forEach((el) => el.classList.toggle("active", lang === "fr"));
  setStoredLanguage(lang);
}
