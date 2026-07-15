/**
 * admin.js — chế độ quản trị: đăng nhập bằng GitHub fine-grained PAT (lưu trong
 * localStorage của trình duyệt, không bao giờ commit lên repo), thêm ảnh vào
 * chuyến đi có sẵn, và tạo chuyến đi mới bằng cách bấm vào bản đồ.
 *
 * Toàn bộ thao tác ghi dữ liệu dùng trực tiếp GitHub Contents API từ trình
 * duyệt (fetch), không cần server/backend riêng.
 */

(function () {
  const GH_OWNER = "luckyguyen-gif";
  const GH_REPO = "voyages";
  const GH_BRANCH = "main";
  const GH_API = "https://api.github.com";
  const TOKEN_KEY = "lucky-voyages-admin-token";

  const TRIPS_JS_HEADER = `/**
 * DỮ LIỆU CÁC CHUYẾN ĐI / TRIP DATA
 * ----------------------------------------------------------------
 * Đây là nơi DUY NHẤT bạn cần sửa để thêm/xoá/sửa một chuyến đi.
 * Xem hướng dẫn chi tiết trong README.md ("Cách thêm một chuyến đi mới").
 *
 * Cấu trúc mỗi chuyến đi:
 *   id          : mã định danh duy nhất, không dấu, không khoảng trắng
 *                 (dùng làm tên thư mục ảnh: photos/<id>/)
 *   name        : tên thành phố/địa điểm hiển thị trên bản đồ
 *   country     : { vi, fr } tên quốc gia song ngữ
 *   lat, lng    : toạ độ địa lý (vĩ độ, kinh độ)
 *   date        : { vi, fr } thời gian chuyến đi, hiển thị song ngữ
 *   description : { vi, fr } đoạn kể chuyện ngắn, song ngữ
 *   photos      : danh sách tên file ảnh, đặt trong thư mục photos/<id>/
 *                 (thay các file .svg placeholder này bằng ảnh .jpg/.png thật)
 *
 * File này cũng được chỉnh sửa tự động bởi chế độ Quản trị (js/admin.js) khi
 * bạn thêm ảnh hoặc tạo chuyến đi mới từ giao diện web.
 */

`;

  let adminToken = localStorage.getItem(TOKEN_KEY);
  let lastRenderedTrip = null;
  let pendingUploadTripId = null;
  let idFieldTouched = false;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    buildAdminDom();
    wireFooterEntry();
    wireGlobalEvents();

    if (adminToken) {
      document.body.classList.add("admin-mode");
      showAdminMapHint();
      // Kiểm tra âm thầm — nếu token hết hạn thì thoát chế độ quản trị,
      // không làm phiền khách xem trang bình thường.
      verifyToken(adminToken).catch(() => {
        clearToken();
        document.body.classList.remove("admin-mode");
        hideAdminMapHint();
      });
    }
  }

  /* ------------------------------ DOM khởi tạo ------------------------------ */

  function buildAdminDom() {
    const overlay = document.createElement("div");
    overlay.id = "admin-modal-overlay";
    overlay.className = "admin-modal-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `<div class="admin-modal" id="admin-modal" role="dialog" aria-modal="true"></div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);

    const toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "admin-toast";
    toast.hidden = true;
    document.body.appendChild(toast);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "admin-photo-input";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.hidden = true;
    fileInput.addEventListener("change", onFilesSelected);
    document.body.appendChild(fileInput);
  }

  function wireFooterEntry() {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "admin-entry";
    btn.className = "admin-entry";
    btn.textContent = "Quản trị";
    btn.addEventListener("click", () => {
      if (isAdminMode()) {
        openStatusModal();
      } else {
        openLoginModal();
      }
    });
    footer.appendChild(btn);
  }

  function wireGlobalEvents() {
    window.addEventListener("voyages:album-rendered", (e) => {
      lastRenderedTrip = e.detail.trip;
      if (isAdminMode()) injectAddPhotoButton(e.detail.trip);
    });

    window.addEventListener("voyages:map-click", (e) => {
      if (!isAdminMode()) return;
      openNewTripModal(e.detail.latlng);
    });
  }

  /* ------------------------------ Token / trạng thái đăng nhập ------------------------------ */

  function isAdminMode() {
    return !!adminToken;
  }

  function setToken(token) {
    adminToken = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    adminToken = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  async function verifyToken(token) {
    const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 200) {
      const data = await res.json();
      const perms = data.permissions || {};
      if (!perms.push) {
        throw new Error(
          'Token hợp lệ nhưng không có quyền ghi vào repo "voyages". Kiểm tra lại quyền "Contents: Read and write" khi tạo token.'
        );
      }
      return true;
    }
    throw await toGithubError(res);
  }

  /* ------------------------------ Modal: đăng nhập / trạng thái ------------------------------ */

  function openLoginModal() {
    openModal(`
      <h3>Đăng nhập quản trị</h3>
      <p>
        Dán vào đây GitHub fine-grained Personal Access Token — chỉ cấp quyền cho repo
        <strong>${GH_OWNER}/${GH_REPO}</strong>, quyền <strong>Contents: Read and write</strong>.
        Token chỉ được lưu trong trình duyệt này (localStorage) và chỉ gửi tới GitHub, không gửi đi đâu khác.
      </p>
      <label>
        Personal Access Token
        <input type="password" id="admin-token-input" placeholder="github_pat_..." autocomplete="off" />
      </label>
      <div class="admin-modal-error" id="admin-token-error" hidden></div>
      <div class="admin-modal-actions">
        <button type="button" class="btn-secondary" id="admin-token-cancel">Hủy</button>
        <button type="button" class="btn-primary" id="admin-token-submit">Xác nhận</button>
      </div>
    `);

    const input = document.getElementById("admin-token-input");
    const errorBox = document.getElementById("admin-token-error");
    const submitBtn = document.getElementById("admin-token-submit");

    document.getElementById("admin-token-cancel").addEventListener("click", closeModal);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitBtn.click();
    });

    submitBtn.addEventListener("click", async () => {
      const token = input.value.trim();
      errorBox.hidden = true;
      if (!token) {
        errorBox.textContent = "Vui lòng dán token trước khi xác nhận.";
        errorBox.hidden = false;
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang kiểm tra...";
      try {
        await verifyToken(token);
        setToken(token);
        document.body.classList.add("admin-mode");
        showAdminMapHint();
        if (lastRenderedTrip) injectAddPhotoButton(lastRenderedTrip);
        closeModal();
        showSuccess("Đã bật chế độ Quản trị.");
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Xác nhận";
      }
    });

    input.focus();
  }

  function openStatusModal() {
    openModal(`
      <h3>Chế độ Quản trị</h3>
      <p>Bạn đang đăng nhập quản trị cho trang này.</p>
      <p>
        Bấm vào một ghim hoặc thẻ chuyến đi để thêm ảnh, hoặc bấm vào vùng trống trên bản đồ
        để tạo chuyến đi mới tại đúng vị trí đó.
      </p>
      <div class="admin-modal-actions">
        <button type="button" class="btn-secondary" id="admin-modal-close">Đóng</button>
        <button type="button" class="btn-danger" id="admin-logout">Đăng xuất</button>
      </div>
    `);

    document.getElementById("admin-modal-close").addEventListener("click", closeModal);
    document.getElementById("admin-logout").addEventListener("click", () => {
      clearToken();
      document.body.classList.remove("admin-mode");
      hideAdminMapHint();
      document.querySelectorAll(".admin-add-photo-btn").forEach((btn) => btn.remove());
      closeModal();
      showSuccess("Đã đăng xuất khỏi chế độ Quản trị.");
    });
  }

  function openModal(html) {
    const overlay = document.getElementById("admin-modal-overlay");
    const modal = document.getElementById("admin-modal");
    modal.innerHTML = html;
    overlay.hidden = false;
  }

  function closeModal() {
    const overlay = document.getElementById("admin-modal-overlay");
    overlay.hidden = true;
    document.getElementById("admin-modal").innerHTML = "";
  }

  function showAdminMapHint() {
    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap || mapWrap.querySelector(".admin-map-hint")) return;
    const hint = document.createElement("div");
    hint.className = "admin-map-hint";
    hint.textContent = "Chế độ Quản trị đang bật — bấm vào bản đồ để thêm chuyến đi mới";
    mapWrap.appendChild(hint);
  }

  function hideAdminMapHint() {
    document.querySelectorAll(".admin-map-hint").forEach((el) => el.remove());
  }

  /* ------------------------------ Nút "Thêm ảnh" trong album ------------------------------ */

  function injectAddPhotoButton(trip) {
    const container = document.getElementById("album-content");
    if (!container) return;
    const header = container.querySelector(".album-header");
    if (!header || header.querySelector(".admin-add-photo-btn")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "admin-add-photo-btn";
    btn.textContent = "+ Thêm ảnh";
    btn.addEventListener("click", () => {
      pendingUploadTripId = trip.id;
      document.getElementById("admin-photo-input").click();
    });
    header.appendChild(btn);
  }

  function onFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !pendingUploadTripId) return;
    uploadPhotosToTrip(pendingUploadTripId, files);
  }

  async function uploadPhotosToTrip(tripId, files) {
    const trips = window.VoyagesApp.getTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    showProgress(`Đang chuẩn bị ${files.length} ảnh...`);
    try {
      let nextNum = nextPhotoNumber(trip);
      const uploaded = [];

      for (let i = 0; i < files.length; i++) {
        updateProgress(i, files.length, `Đang nén ảnh ${i + 1}/${files.length}...`);
        const blob = await resizeAndCompressImage(files[i], 1920, 0.8);
        const base64 = await blobToBase64(blob);
        const filename = `${nextNum}.jpg`;

        updateProgress(i, files.length, `Đang tải ảnh ${i + 1}/${files.length} lên GitHub...`);
        await putContentsFile(
          `photos/${trip.id}/${filename}`,
          base64,
          `Thêm ảnh ${filename} cho ${trip.name}`,
          null
        );

        uploaded.push(filename);
        nextNum++;
      }

      updateProgress(files.length, files.length, "Đang cập nhật danh sách ảnh...");
      await appendPhotosToTripsJs(tripId, uploaded);

      trip.photos.push(...uploaded);
      window.VoyagesApp.refreshMarkerIcons();
      window.VoyagesApp.renderTripList();
      window.VoyagesApp.renderAlbum(trip);

      showSuccess(`Đã lưu ${uploaded.length} ảnh! Trang sẽ tự cập nhật sau 1–2 phút.`);
    } catch (err) {
      showError(err.message || "Có lỗi xảy ra khi tải ảnh lên.");
    }
  }

  function nextPhotoNumber(trip) {
    const nums = trip.photos
      .map((f) => {
        const m = f.match(/^(\d+)\./);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((n) => n !== null);
    return nums.length ? Math.max(...nums) + 1 : 1;
  }

  async function appendPhotosToTripsJs(tripId, filenames) {
    const { content, sha } = await getContentsFile("data/trips.js");
    const trips = parseTripsJs(content);
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Không tìm thấy chuyến đi này trong data/trips.js.');
    trip.photos.push(...filenames);
    const newText = serializeTripsJs(trips);
    await putContentsFile(
      "data/trips.js",
      utf8ToBase64(newText),
      `Thêm ${filenames.length} ảnh cho ${trip.name}`,
      sha
    );
  }

  /* ------------------------------ Tạo chuyến đi mới từ bản đồ ------------------------------ */

  function openNewTripModal(latlng) {
    idFieldTouched = false;
    const lat = Math.round(latlng.lat * 10000) / 10000;
    const lng = Math.round(latlng.lng * 10000) / 10000;

    openModal(`
      <h3>Tạo chuyến đi mới</h3>
      <p class="admin-form-coords">Toạ độ đã chọn: <strong>${lat}, ${lng}</strong></p>
      <label>Tên thành phố / địa điểm<input type="text" id="ntf-name" placeholder="Tokyo" /></label>
      <label>Mã chuyến đi (id, dùng làm tên thư mục ảnh)<input type="text" id="ntf-id" placeholder="tokyo" /></label>
      <label>Quốc gia (Tiếng Việt)<input type="text" id="ntf-country-vi" placeholder="Nhật Bản" /></label>
      <label>Pays (Français)<input type="text" id="ntf-country-fr" placeholder="Japon" /></label>
      <label>Thời gian (Tiếng Việt)<input type="text" id="ntf-date-vi" placeholder="Tháng 3, 2024" /></label>
      <label>Date (Français)<input type="text" id="ntf-date-fr" placeholder="Mars 2024" /></label>
      <label>Mô tả (Tiếng Việt)<textarea id="ntf-desc-vi" rows="3" placeholder="Kể một câu chuyện ngắn..."></textarea></label>
      <label>Description (Français)<textarea id="ntf-desc-fr" rows="3" placeholder="Racontez une courte histoire..."></textarea></label>
      <div class="admin-modal-error" id="ntf-error" hidden></div>
      <div class="admin-modal-actions">
        <button type="button" class="btn-secondary" id="ntf-cancel">Hủy</button>
        <button type="button" class="btn-primary" id="ntf-submit">Lưu chuyến đi</button>
      </div>
    `);

    const nameInput = document.getElementById("ntf-name");
    const idInput = document.getElementById("ntf-id");

    nameInput.addEventListener("input", () => {
      if (!idFieldTouched) idInput.value = slugify(nameInput.value);
    });
    idInput.addEventListener("input", () => {
      idFieldTouched = true;
    });

    document.getElementById("ntf-cancel").addEventListener("click", closeModal);
    document.getElementById("ntf-submit").addEventListener("click", () => {
      submitNewTrip({
        id: idInput.value.trim() || slugify(nameInput.value || ""),
        name: nameInput.value.trim(),
        country: {
          vi: document.getElementById("ntf-country-vi").value.trim(),
          fr: document.getElementById("ntf-country-fr").value.trim(),
        },
        lat,
        lng,
        date: {
          vi: document.getElementById("ntf-date-vi").value.trim(),
          fr: document.getElementById("ntf-date-fr").value.trim(),
        },
        description: {
          vi: document.getElementById("ntf-desc-vi").value.trim(),
          fr: document.getElementById("ntf-desc-fr").value.trim(),
        },
        photos: [],
      });
    });

    nameInput.focus();
  }

  async function submitNewTrip(trip) {
    const errorBox = document.getElementById("ntf-error");
    const submitBtn = document.getElementById("ntf-submit");
    errorBox.hidden = true;

    if (!trip.name || !trip.id) {
      errorBox.textContent = "Vui lòng nhập tên thành phố và mã chuyến đi.";
      errorBox.hidden = false;
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trip.id)) {
      errorBox.textContent = "Mã chuyến đi chỉ được chứa chữ thường không dấu, số và dấu gạch ngang.";
      errorBox.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang lưu...";

    try {
      const { content, sha } = await getContentsFile("data/trips.js");
      const trips = parseTripsJs(content);
      if (trips.some((t) => t.id === trip.id)) {
        throw new Error(`Mã chuyến đi "${trip.id}" đã tồn tại. Vui lòng chọn mã khác.`);
      }
      trips.push(trip);
      const newText = serializeTripsJs(trips);
      await putContentsFile("data/trips.js", utf8ToBase64(newText), `Thêm chuyến đi mới: ${trip.name}`, sha);

      window.VoyagesApp.addTrip(trip);
      closeModal();
      window.VoyagesApp.selectTrip(trip.id, { flyTo: true });
      showSuccess("Đã tạo chuyến đi mới! Trang sẽ tự cập nhật sau 1–2 phút. Bạn có thể thêm ảnh ngay bây giờ.");
    } catch (err) {
      errorBox.textContent = err.message || "Có lỗi xảy ra khi tạo chuyến đi.";
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Lưu chuyến đi";
    }
  }

  /* ------------------------------ GitHub Contents API ------------------------------ */

  async function ghFetch(path, options) {
    options = options || {};
    const res = await fetch(`${GH_API}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${adminToken}`,
        ...(options.headers || {}),
      },
    });
    return res;
  }

  async function getContentsFile(path) {
    const res = await ghFetch(`/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`);
    if (!res.ok) throw await toGithubError(res);
    const data = await res.json();
    return { content: base64ToUtf8(data.content), sha: data.sha };
  }

  async function putContentsFile(path, base64Content, message, sha) {
    const body = { message, content: base64Content, branch: GH_BRANCH };
    if (sha) body.sha = sha;
    const res = await ghFetch(`/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await toGithubError(res);
    return res.json();
  }

  async function toGithubError(res) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data.message || "";
    } catch (e) {
      // phản hồi không phải JSON — bỏ qua
    }
    if (res.status === 401) {
      return new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng xuất và dán token mới.");
    }
    if (res.status === 403) {
      return new Error(
        'Token không có đủ quyền (cần quyền "Contents: Read and write" trên repo voyages), hoặc đã vượt giới hạn gọi API. Vui lòng thử lại sau ít phút.'
      );
    }
    if (res.status === 404) {
      return new Error("Không tìm thấy kho lưu trữ, hoặc token của bạn không có quyền truy cập repo này.");
    }
    if (res.status === 409) {
      return new Error("Có xung đột dữ liệu (file vừa được cập nhật ở nơi khác). Vui lòng thử lại.");
    }
    if (res.status === 422) {
      return new Error(`Dữ liệu gửi lên không hợp lệ: ${detail || "vui lòng kiểm tra lại thông tin."}`);
    }
    return new Error(`Lỗi GitHub API (${res.status}): ${detail || "không rõ nguyên nhân"}`);
  }

  /* ------------------------------ Đọc/ghi data/trips.js ------------------------------ */

  function parseTripsJs(text) {
    const runner = new Function(`${text}\nreturn TRIPS;`);
    return runner();
  }

  function serializeTripsJs(trips) {
    const body = trips.map(serializeTrip).join(",\n");
    return `${TRIPS_JS_HEADER}const TRIPS = [\n${body},\n];\n`;
  }

  function serializeTrip(trip) {
    const s = (v) => JSON.stringify(v);
    return [
      "  {",
      `    id: ${s(trip.id)},`,
      `    name: ${s(trip.name)},`,
      `    country: { vi: ${s(trip.country.vi)}, fr: ${s(trip.country.fr)} },`,
      `    lat: ${trip.lat},`,
      `    lng: ${trip.lng},`,
      `    date: { vi: ${s(trip.date.vi)}, fr: ${s(trip.date.fr)} },`,
      "    description: {",
      `      vi: ${s(trip.description.vi)},`,
      `      fr: ${s(trip.description.fr)},`,
      "    },",
      `    photos: [${trip.photos.map(s).join(", ")}],`,
      "  }",
    ].join("\n");
  }

  /* ------------------------------ Ảnh: resize + nén qua canvas ------------------------------ */

  function resizeAndCompressImage(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error(`Không thể nén ảnh "${file.name}".`));
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Không thể đọc ảnh "${file.name}". Hãy chắc chắn đây là file ảnh hợp lệ.`));
      };

      img.src = url;
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(new Error("Không thể đọc dữ liệu ảnh."));
      reader.readAsDataURL(blob);
    });
  }

  /* ------------------------------ Tiện ích ------------------------------ */

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  function base64ToUtf8(b64) {
    const binary = atob(b64.replace(/\n/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function slugify(str) {
    const base = String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "");
    return base || "chuyen-di";
  }

  /* ------------------------------ Toast: tiến trình / thông báo ------------------------------ */

  function ensureToast() {
    return document.getElementById("admin-toast");
  }

  function showProgress(text) {
    const toast = ensureToast();
    toast.className = "admin-toast admin-toast--progress";
    toast.innerHTML = `
      <div class="admin-toast-text">${window.VoyagesApp.escapeHtml(text)}</div>
      <div class="admin-toast-bar"><div class="admin-toast-bar-fill" style="width:0%"></div></div>
    `;
    toast.hidden = false;
  }

  function updateProgress(done, total, text) {
    const toast = ensureToast();
    const pct = total ? Math.round((done / total) * 100) : 0;
    const textEl = toast.querySelector(".admin-toast-text");
    const fillEl = toast.querySelector(".admin-toast-bar-fill");
    if (textEl) textEl.textContent = text;
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  function showSuccess(text) {
    const toast = ensureToast();
    toast.className = "admin-toast admin-toast--success";
    toast.innerHTML = `<div class="admin-toast-text">${window.VoyagesApp.escapeHtml(text)}</div>`;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 5000);
  }

  function showError(text) {
    const toast = ensureToast();
    toast.className = "admin-toast admin-toast--error";
    toast.innerHTML = `<div class="admin-toast-text">${window.VoyagesApp.escapeHtml(text)}</div>`;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 7000);
  }
})();
