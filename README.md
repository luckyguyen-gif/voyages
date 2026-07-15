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
│   └── main.js           # Bản đồ, danh sách chuyến đi, album, lightbox
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
