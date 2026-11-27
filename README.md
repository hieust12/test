# MEO FLOWERS — Bản Hoàn Chỉnh Bàn Giao Khách Hàng

## 1. Cấu trúc dự án (Mở bằng VS Code)
- `config.js`: Nơi duy nhất cần chỉnh sửa khi bàn giao (số hotline, link Zalo, Fanpage, Instagram, TikTok, mã PIN Chủ Shop `2026` và khóa Firebase).
- `index.html`: Giao diện trang web chuẩn nhận diện Meo Flowers (logo mèo đen ngửi hoa tulip trắng, 3 gói ngân sách, thanh lọc 6 nhóm tone màu, popup liên hệ nhanh).
- `style.css`: Toàn bộ giao diện tông hồng phấn `#FBF6F6` và xanh rêu `#2F4842`.
- `app.js`: Xử lý lọc Tone màu + Ngân sách, đếm số lượng từng nhóm, bảo mật PIN Chủ Shop, xóa từng mẫu và đồng bộ Firebase Firestore.
- `data/products.json`: Dữ liệu mẫu mặc định.

## 2. Hướng dẫn triển khai & bàn giao cho khách
### Bước 1: Điền thông tin thật của shop
Mở file `config.js` trên VS Code và thay các đường dẫn `hotline`, `zaloLink`, `fanpageLink`, `instagramLink`, `tiktokLink` và `adminPin`.

### Bước 2: Bật đồng bộ ảnh trực tuyến (Để chủ shop up ảnh trên điện thoại là khách thấy ngay)
1. Truy cập https://console.firebase.google.com -> Tạo dự án mới -> Bật **Firestore Database** (chọn chế độ Test mode).
2. Vào **Project Settings** -> Thêm ứng dụng Web (`</>`) -> Copy đoạn `firebaseConfig`.
3. Dán vào mục `firebaseConfig` trong file `config.js`.

### Bước 3: Đưa web lên mạng (GitHub Pages / Netlify)
- Đẩy toàn bộ thư mục này lên repository GitHub (ví dụ `nganhhthu-byte.github.io`) hoặc kéo thả vào **Netlify Drop** để lấy link bàn giao cho khách.

## 3. Tính năng Đăng nhập & Đăng ký Khách hàng (Mới cập nhật)
- Khách hàng có thể **Đăng ký** tài khoản mới (Họ tên, Số điện thoại, Email, Mật khẩu) và **Đăng nhập** ngay trên giao diện web (nút trên thanh Header, menu trượt hoặc thanh banner trong khu vực Bộ sưu tập).
- Hỗ trợ chỉnh sửa hồ sơ khách hàng (Họ tên, SĐT, Email, Địa chỉ nhận hoa mặc định) và đồng bộ các mẫu hoa đã lưu (`Lưu mẫu`).
- Dữ liệu tài khoản khách hàng lưu tại `localStorage` / `sessionStorage` trên trình duyệt.
