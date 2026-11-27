// =========================================================
// CẤU HÌNH BÀN GIAO SHOP MEO FLOWERS (CHỈ SỬA FILE NÀY)
// =========================================================
const SHOP_CONFIG = {
  shopName: "MEO FLOWERS",
  subName: "Meo Flowersandcrochet",
  hotline: "0900000000",                   // Thay số điện thoại thật của shop
  zaloLink: "https://zalo.me/0900000000",  // Thay link Zalo thật
  fanpageLink: "https://facebook.com",     // Thay link Fanpage thật
  instagramLink: "https://instagram.com",  // Thay link Instagram thật
  tiktokLink: "https://tiktok.com",        // Thay link TikTok thật
  adminPin: "2026",                        // Mã PIN mở khóa chế độ Chủ Shop

  // Kết nối Firebase Firestore miễn phí để chủ shop đăng ảnh từ điện thoại là khách thấy ngay.
  // Nếu để trống apiKey, web tự động chạy bằng dữ liệu trong data/products.json + LocalStorage.
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  }
};
