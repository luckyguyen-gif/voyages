/**
 * main.js — logic chính của trang: bản đồ, danh sách chuyến đi, album, song ngữ.
 * Không dùng framework, không cần build. Dữ liệu lấy từ data/trips.js (biến TRIPS).
 */

(function () {
  let currentLang = getStoredLanguage();
  let selectedTripId = null;
  let map = null;
  let markerClusterGroup = null;
  const markersById = {};
  let lightbox = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    applyLanguage(currentLang);
    renderTripList();
    initMap();
    setupLangToggle();
    setupNavToggle();
  }

  /* ------------------------------ Danh sách chuyến đi ------------------------------ */

  function renderTripList() {
    const list = document.getElementById("trip-list");
    list.innerHTML = "";

    TRIPS.forEach((trip) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "trip-card" + (trip.id === selectedTripId ? " active" : "");
      card.setAttribute("data-trip-id", trip.id);

      const photosLabel = translate("photosCount", currentLang);

      card.innerHTML = `
        <span class="trip-city">${escapeHtml(trip.name)}</span>
        <span class="trip-country">${escapeHtml(trip.country[currentLang])}</span>
        <span class="trip-meta">
          <span>${escapeHtml(trip.date[currentLang])}</span>
          <span>${trip.photos.length} ${escapeHtml(photosLabel)}</span>
        </span>
      `;

      card.addEventListener("click", () => selectTrip(trip.id, { flyTo: true }));
      list.appendChild(card);
    });
  }

  /* ------------------------------ Bản đồ ------------------------------ */

  function initMap() {
    map = L.map("map", {
      scrollWheelZoom: true,
      worldCopyJump: true,
    }).setView([25, 20], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="marker-cluster-custom">${cluster.getChildCount()}</div>`,
          className: "",
          iconSize: L.point(42, 42),
        }),
    });

    TRIPS.forEach((trip) => {
      const marker = L.marker([trip.lat, trip.lng], {
        icon: buildTripIcon(trip),
      });

      marker.on("click", () => selectTrip(trip.id, { flyTo: true }));

      markersById[trip.id] = marker;
      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);
  }

  function buildTripIcon(trip) {
    const isActive = trip.id === selectedTripId;
    return L.divIcon({
      className: "",
      html: `
        <div class="trip-marker${isActive ? " active" : ""}">
          <div class="pin"><span class="pin-count">${trip.photos.length}</span></div>
          <div class="pin-label">${escapeHtml(trip.name)}</div>
        </div>
      `,
      iconSize: [90, 56],
      iconAnchor: [19, 50],
      popupAnchor: [0, -50],
    });
  }

  function refreshMarkerIcons() {
    TRIPS.forEach((trip) => {
      const marker = markersById[trip.id];
      if (marker) marker.setIcon(buildTripIcon(trip));
    });
  }

  /* ------------------------------ Chọn chuyến đi ------------------------------ */

  function selectTrip(tripId, options) {
    options = options || {};
    const trip = TRIPS.find((t) => t.id === tripId);
    if (!trip) return;

    selectedTripId = tripId;

    // Cập nhật thẻ bên trái
    document.querySelectorAll(".trip-card").forEach((card) => {
      card.classList.toggle("active", card.getAttribute("data-trip-id") === tripId);
    });

    // Cập nhật ghim trên bản đồ
    refreshMarkerIcons();

    if (options.flyTo && map) {
      const targetZoom = Math.max(map.getZoom(), 6);
      // Nếu marker đang bị gộp cụm, mở cụm ra trước khi bay tới
      const marker = markersById[tripId];
      if (marker && markerClusterGroup.hasLayer(marker)) {
        markerClusterGroup.zoomToShowLayer(marker, () => {
          map.flyTo([trip.lat, trip.lng], targetZoom, { duration: 1.4 });
        });
      } else {
        map.flyTo([trip.lat, trip.lng], targetZoom, { duration: 1.4 });
      }
    }

    renderAlbum(trip);

    document.getElementById("album-section").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ------------------------------ Album ------------------------------ */

  function renderAlbum(trip) {
    const container = document.getElementById("album-content");
    const photosLabel = translate("photosCount", currentLang);

    const photosHtml = trip.photos
      .map((file) => {
        const src = `photos/${trip.id}/${file}`;
        return `
          <a class="photo-thumb glightbox" href="${src}" data-gallery="trip-${trip.id}">
            <img src="${src}" alt="${escapeHtml(trip.name)}" loading="lazy" />
          </a>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="album-header">
        <div class="album-city">${escapeHtml(trip.name)}, ${escapeHtml(trip.country[currentLang])}</div>
        <div class="album-meta">
          <span>${escapeHtml(trip.date[currentLang])}</span>
          <span class="dot">&bull;</span>
          <span>${trip.photos.length} ${escapeHtml(photosLabel)}</span>
        </div>
        <p class="album-story">${escapeHtml(trip.description[currentLang])}</p>
      </div>
      <div class="album-grid">
        ${photosHtml}
      </div>
    `;

    if (lightbox) {
      lightbox.destroy();
    }
    lightbox = GLightbox({ selector: ".glightbox" });
  }

  /* ------------------------------ Song ngữ ------------------------------ */

  function setupLangToggle() {
    const btn = document.getElementById("lang-toggle");
    btn.addEventListener("click", () => {
      currentLang = currentLang === "vi" ? "fr" : "vi";
      applyLanguage(currentLang);
      renderTripList();

      const trip = TRIPS.find((t) => t.id === selectedTripId);
      if (trip) renderAlbum(trip);
    });
  }

  /* ------------------------------ Menu di động ------------------------------ */

  function setupNavToggle() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.querySelector(".main-nav");

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------ Tiện ích ------------------------------ */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
