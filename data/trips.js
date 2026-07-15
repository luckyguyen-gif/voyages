/**
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
 */

const TRIPS = [
  {
    id: "paris",
    name: "Paris",
    country: { vi: "Pháp", fr: "France" },
    lat: 48.8566,
    lng: 2.3522,
    date: { vi: "Tháng 5, 2023", fr: "Mai 2023" },
    description: {
      vi: "Paris đón mình bằng những buổi sáng sương mờ bên sông Seine và mùi bánh mì nướng thơm lừng góc phố. Từ tháp Eiffel lấp lánh về đêm đến những con hẻm nhỏ ở Montmartre, mỗi bước chân đều như một trang nhật ký lãng mạn.",
      fr: "Paris m'a accueilli avec des matins brumeux le long de la Seine et l'odeur du pain frais à chaque coin de rue. De la tour Eiffel scintillante la nuit aux ruelles de Montmartre, chaque pas ressemblait à une page de journal romantique.",
    },
    // Ảnh mẫu: các ô màu placeholder (.svg). Thay bằng ảnh thật, ví dụ: "1.jpg", "2.jpg"...
    photos: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"],
  },
  {
    id: "roma",
    name: "Roma",
    country: { vi: "Ý", fr: "Italie" },
    lat: 41.9028,
    lng: 12.4964,
    date: { vi: "Tháng 6, 2023", fr: "Juin 2023" },
    description: {
      vi: "Roma là một bảo tàng sống, nơi mỗi góc phố đều va vào một mảnh lịch sử hàng nghìn năm. Mình đã đi bộ mỏi chân giữa đấu trường Colosseum, ăn gelato bên đài phun nước Trevi và lạc trong những con phố đá cổ kính.",
      fr: "Rome est un musée vivant où chaque coin de rue croise un fragment d'histoire millénaire. J'ai marché sans relâche autour du Colisée, mangé une glace près de la fontaine de Trevi et me suis perdu dans ses rues pavées.",
    },
    photos: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg"],
  },
  {
    id: "hanoi",
    name: "Hà Nội",
    country: { vi: "Việt Nam", fr: "Vietnam" },
    lat: 21.0285,
    lng: 105.8542,
    date: { vi: "Tháng 10, 2023", fr: "Octobre 2023" },
    description: {
      vi: "Trở về Hà Nội vào mùa thu, mình ngồi nhâm nhi cà phê trứng bên Hồ Gươm, nghe tiếng leng keng tàu điện cũ và ngắm lá vàng rơi trên phố cổ. Một thành phố nghìn năm tuổi nhưng chưa bao giờ hết mới mẻ trong mắt mình.",
      fr: "De retour à Hanoï en automne, j'ai savouré un café à l'œuf près du lac Hoan Kiem, écouté le tintement du vieux tramway et regardé les feuilles dorées tomber dans la vieille ville. Une ville millénaire, toujours aussi neuve à mes yeux.",
    },
    photos: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg", "7.svg"],
  },
  {
    id: "bali",
    name: "Bali",
    country: { vi: "Indonesia", fr: "Indonésie" },
    lat: -8.6500,
    lng: 115.1900,
    date: { vi: "Tháng 1, 2024", fr: "Janvier 2024" },
    description: {
      vi: "Bali là những ruộng bậc thang xanh mướt ở Ubud, tiếng sóng vỗ ở Uluwatu và các đền thờ cổ kính giữa làn khói trầm hương. Mình học cách sống chậm lại, đón bình minh trên núi lửa và tận hưởng từng khoảnh khắc yên bình.",
      fr: "Bali, ce sont les rizières en terrasses verdoyantes d'Ubud, le bruit des vagues à Uluwatu et des temples anciens enveloppés de fumée d'encens. J'ai appris à ralentir, à admirer le lever du soleil sur un volcan et à savourer chaque instant de paix.",
    },
    photos: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg", "7.svg", "8.svg"],
  },
];
