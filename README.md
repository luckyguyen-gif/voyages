# Hành trình của Lucky 🌍

Một trang blog du lịch tĩnh (static site) dạng **bản đồ tương tác**, xây bằng HTML/CSS/JavaScript thuần —
không framework, không bước build. Chạy trực tiếp trên GitHub Pages.

## Xem thử

Sau khi bật GitHub Pages (xem bên dưới), trang sẽ chạy tại:

```
https://<tên-tài-khoản-github>.github.io/<tên-repo>/
```

Muốn xem thử trên máy trước khi đưa lên GitHub, chỉ cần chạy một server tĩnh đơn giản ở thư mục gốc, ví dụ:

```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

(Không thể mở trực tiếp file `index.html` bằng cách bấm đúp, vì trình duyệt sẽ chặn việc tải file JS module
theo đường dẫn tương đối `file://`. Luôn chạy qua một server nhỏ như trên.)

## Cấu trúc thư mục

```
├── index.html          # Trang duy nhất của toàn bộ site
├── css/style.css        # Toàn bộ giao diện
├── js/
│   ├── i18n.js           # Từ điển song ngữ VI/FR + hàm áp dụng ngôn ngữ
│   ├── main.js           # Bản đồ, danh sách chuyến đi, album, lightbox
│   └── admin.js          # Chế độ Quản trị: thêm ảnh / tạo chuyến đi mới từ trình duyệt
├── data/trips.js         # ⭐ TOÀN BỘ DỮ LIỆU CHUYẾN ĐI — sửa file này để thêm/xoá chuyến đi
└── photos/
    ├── paris/            # Ảnh của từng chuyến đi, một thư mục con theo "id"
    ├── roma/
    ├── hanoi/
    └── bali/
```

Ảnh mẫu hiện tại là các ô màu placeholder (`.svg`) để bạn hình dung bố cục — hãy thay bằng ảnh thật của bạn.

## Cách thêm một chuyến đi mới

**Bước 1 — Tạo thư mục ảnh**

Tạo một thư mục mới trong `photos/`, đặt tên ngắn gọn không dấu, không khoảng trắng (đây sẽ là "id" của
chuyến đi). Ví dụ muốn thêm chuyến đi Tokyo:

```
photos/tokyo/
```

**Bước 2 — Upload ảnh**

Bỏ các file ảnh (`.jpg`, `.jpeg`, `.png`, `.webp`...) vào thư mục vừa tạo, ví dụ:

```
photos/tokyo/1.jpg
photos/tokyo/2.jpg
photos/tokyo/3.jpg
```

Mẹo: nên resize ảnh xuống khoảng 1200–1600px chiều ngang trước khi upload để trang tải nhanh.

**Bước 3 — Thêm một mục vào `data/trips.js`**

Mở file `data/trips.js`, thêm một object mới vào mảng `TRIPS` (copy một chuyến đi có sẵn rồi sửa lại
cho nhanh):

```js
{
  id: "tokyo",                              // trùng với tên thư mục ở bước 1
  name: "Tokyo",                            // tên hiển thị trên bản đồ và thẻ
  country: { vi: "Nhật Bản", fr: "Japon" }, // tên quốc gia song ngữ
  lat: 35.6762,                             // toạ độ vĩ độ
  lng: 139.6503,                            // toạ độ kinh độ
  date: { vi: "Tháng 3, 2024", fr: "Mars 2024" },
  description: {
    vi: "Đoạn kể chuyện ngắn bằng tiếng Việt về chuyến đi này...",
    fr: "Un court récit en français sur ce voyage...",
  },
  photos: ["1.jpg", "2.jpg", "3.jpg"],      // đúng tên file đã upload ở bước 2
},
```

Lưu file lại — vậy là xong! Không cần build, không cần cài đặt gì thêm. Khi đẩy (push/commit) lên
GitHub, GitHub Pages sẽ tự cập nhật trang sau khoảng 1 phút.

> Lấy toạ độ (lat/lng) ở đâu? Vào [OpenStreetMap](https://www.openstreetmap.org), tìm địa điểm, bấm chuột
> phải chọn "Show address" hoặc "Hiển thị địa chỉ" để lấy toạ độ.

## Cách đổi tên trang web

Tên trang "Hành trình của Lucky" xuất hiện ở 3 chỗ, cần đổi đồng bộ cả tiếng Việt lẫn tiếng Pháp:

1. **`index.html`** — thẻ `<title>` và phần logo trong header (`<div class="logo">`).
2. **`js/i18n.js`** — hai khoá `siteTitle` (tiếng Việt) và `siteTitle` trong mục `fr` (tiếng Pháp), cùng
   `footerText` nếu muốn đổi luôn dòng chữ ở chân trang.

Ví dụ đổi tên thành "Hành trình của An":

```js
// js/i18n.js
vi: {
  siteTitle: "Hành trình của An",
  ...
  footerText: "Hành trình của An",
},
fr: {
  siteTitle: "Le voyage d'An",
  ...
  footerText: "Le voyage d'An",
},
```

Phần "Về mình" (`aboutText` trong `js/i18n.js`) cũng nên sửa lại cho đúng với bạn.

## Chế độ Quản trị — thêm ảnh trực tiếp từ trình duyệt, không cần vào GitHub

Trang có sẵn một **chế độ Quản trị** ẩn: chỉ chủ trang mới biết và dùng được, khách xem bình thường
không nhìn thấy bất kỳ nút quản trị nào. Ở chế độ này, bạn có thể:

- Thêm ảnh vào một chuyến đi có sẵn, chọn nhiều ảnh cùng lúc từ máy/điện thoại.
- Tạo một chuyến đi hoàn toàn mới chỉ bằng cách bấm vào vị trí đó trên bản đồ.

Mọi thao tác được lưu thẳng vào kho GitHub qua GitHub API — không cần mở GitHub, không cần Git, không
cần máy tính (dùng được cả trên điện thoại).

### Bước 1 — Tạo GitHub fine-grained Personal Access Token (PAT)

1. Đăng nhập GitHub, vào **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
   (hoặc mở thẳng <https://github.com/settings/personal-access-tokens/new>).
2. Đặt tên token, ví dụ "Quản trị Hành trình của Lucky".
3. **Expiration (hạn dùng)**: chọn khoảng **90 ngày** (nên đặt lịch nhắc để tạo token mới khi hết hạn,
   token càng ngắn hạn càng an toàn).
4. **Repository access**: chọn **Only select repositories**, rồi chọn đúng repo **`voyages`** — không
   cấp quyền cho repo nào khác.
5. **Permissions → Repository permissions**: tìm mục **Contents**, đặt quyền **Read and write**. Không
   cần bật thêm quyền nào khác.
6. Bấm **Generate token**, sau đó **sao chép token ngay** (GitHub chỉ hiện một lần duy nhất, dạng
   `github_pat_...`).

> Token này giống như mật khẩu, chỉ cho quyền ghi vào đúng repo `voyages`. Không chia sẻ token cho ai,
> không dán vào nơi công cộng. Nếu lỡ lộ token, vào lại trang tạo token ở bước 1 để thu hồi (revoke) ngay.

### Bước 2 — Đăng nhập chế độ Quản trị

1. Mở trang web, cuộn xuống cuối trang (footer), bấm nút nhỏ **"Quản trị"**.
2. Dán token vừa tạo vào ô hiện ra, bấm **Xác nhận**. Trang sẽ kiểm tra token với GitHub; nếu hợp lệ,
   chế độ Quản trị được bật và có thông báo "Chế độ Quản trị đang bật" trên bản đồ.
3. Token chỉ được lưu trong **localStorage của trình duyệt đang dùng** — không gửi lên đâu khác ngoài
   GitHub, và không bao giờ được ghi vào code hay commit lên repo. Nếu đổi trình duyệt/máy khác, cần dán
   token lại.
4. Muốn thoát chế độ Quản trị (ví dụ dùng máy chung, máy công cộng), bấm **"Quản trị"** ở footer lần nữa
   rồi bấm **"Đăng xuất"** — token sẽ bị xoá khỏi trình duyệt ngay lập tức.

### Bước 3 — Thêm ảnh vào một chuyến đi có sẵn

1. Ở chế độ Quản trị, bấm vào ghim hoặc thẻ của chuyến đi muốn thêm ảnh (ví dụ Paris).
2. Trong phần album hiện ra bên dưới, bấm nút **"+ Thêm ảnh"**.
3. Chọn một hoặc nhiều ảnh từ máy/điện thoại. Trang sẽ tự động thu nhỏ ảnh về tối đa 1920px chiều dài và
   nén JPEG (~80% chất lượng) ngay trong trình duyệt trước khi tải lên, giúp ảnh nhẹ và trang tải nhanh.
4. Một thanh tiến trình hiện ra trong lúc tải. Khi xong, có thông báo "Đã lưu! Trang sẽ tự cập nhật sau
   1–2 phút" — đây là do GitHub Pages cần một chút thời gian để build lại trang sau khi nhận commit mới.
   Trên trình duyệt bạn đang dùng, ảnh mới đã hiện ngay lập tức.

### Bước 4 — Tạo một chuyến đi mới từ bản đồ

1. Ở chế độ Quản trị, bấm vào **vị trí bất kỳ trên bản đồ** (nơi chưa có ghim).
2. Điền vào form hiện ra: tên thành phố, mã chuyến đi (tự gợi ý từ tên, có thể sửa lại), quốc gia
   (tiếng Việt và tiếng Pháp), thời gian (tiếng Việt và tiếng Pháp), mô tả ngắn (tiếng Việt và tiếng Pháp).
   Toạ độ được lấy tự động từ điểm bạn vừa bấm.
3. Bấm **"Lưu chuyến đi"** — chuyến đi mới xuất hiện ngay trên bản đồ và danh sách bên trái, bạn có thể
   bấm "+ Thêm ảnh" để thêm ảnh cho chuyến đi này luôn.

### Xử lý lỗi thường gặp

- **"Token không hợp lệ hoặc đã hết hạn"**: vào lại trang tạo token (bước 1) để tạo token mới, đăng xuất
  rồi dán token mới vào.
- **"Token không có đủ quyền..."**: kiểm tra lại token đã cấp đúng quyền **Contents: Read and write**
  cho đúng repo `voyages` chưa (bước 1, mục 4–5).
- **"Có xung đột dữ liệu..."**: một thao tác ghi khác vừa xảy ra cùng lúc (hiếm gặp) — chỉ cần thử lại
  thao tác vừa rồi.

## Bật GitHub Pages

1. Vào **Settings → Pages** của repository trên GitHub.
2. Ở mục **Source**, chọn nhánh cần deploy (ví dụ `main`) và thư mục **/ (root)**.
3. Bấm **Save**. Sau khoảng 1 phút, trang sẽ có tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

Không cần cấu hình gì thêm — toàn bộ trang chỉ là HTML/CSS/JS tĩnh, các thư viện bản đồ (Leaflet),
gom ghim (Leaflet.markercluster) và lightbox (GLightbox) đều được tải qua CDN nên không cần cài đặt
hay build bất cứ thứ gì.

## Công nghệ sử dụng

- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) — bản đồ tương tác, miễn phí, không cần API key.
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) — gom các ghim gần nhau khi thu nhỏ bản đồ.
- [GLightbox](https://biati-digital.github.io/glightbox/) — hộp thoại xem ảnh phóng to (lightbox).
- Ngôn ngữ lưu bằng `localStorage`, không cần đăng nhập hay backend.
- [GitHub Contents API](https://docs.github.com/en/rest/repos/contents) — chế độ Quản trị dùng API này để
  commit ảnh và cập nhật `data/trips.js` thẳng từ trình duyệt, không cần server riêng.
