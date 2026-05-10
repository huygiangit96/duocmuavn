# Báo cáo bước 5.8 - Trang Đăng Nhập & Đăng Ký

## Mục tiêu

Xây dựng trang đăng nhập và đăng ký theo prototype `prototype_new/dm-pages.jsx`, giữ inline styles và kết nối Firebase Authentication.

## Nội dung đã thực hiện

- Tạo trang đăng nhập: `frontend/src/app/dang-nhap/page.tsx`
  - Form email/password.
  - Gọi `signInWithEmailAndPassword(auth, email, password)`.
  - Gọi `signInWithPopup(auth, new GoogleAuthProvider())` cho nút đăng nhập Google.
  - Hiển thị lỗi Firebase bằng tiếng Việt:
    - Email không hợp lệ.
    - Không tìm thấy tài khoản.
    - Sai mật khẩu hoặc thông tin đăng nhập.
    - Thử quá nhiều lần.
    - Đóng popup Google.
  - Sau đăng nhập thành công redirect về `?next=` nếu có, ngược lại về `/`.
  - Nếu user đã đăng nhập thì tự redirect `/`.

- Tạo trang đăng ký: `frontend/src/app/dang-ky/page.tsx`
  - Form họ tên, email, mật khẩu, xác nhận mật khẩu.
  - Validate cơ bản: tên, email, mật khẩu tối thiểu 6 ký tự, xác nhận mật khẩu khớp.
  - Gọi `createUserWithEmailAndPassword`.
  - Gọi `updateProfile` để set `displayName`.
  - Sau đăng ký thành công Firebase tự đăng nhập và redirect `/`.
  - Nếu user đã đăng nhập thì tự redirect `/`.

- Giao diện:
  - Copy cấu trúc chính từ `LoginPage` prototype.
  - Giữ background gradient, card trắng bo góc, logo, segmented switch đăng nhập/đăng ký, inline styles và CSS variables.

## Kiểm thử

- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.
- `GET http://localhost:3000/dang-nhap`: trả về `200 OK`.
- `GET http://localhost:3000/dang-ky`: trả về `200 OK`.

## Kết quả

Bước 5.8 đã hoàn thành. Frontend hiện có trang `/dang-nhap` và `/dang-ky`, kết nối Firebase email/password và Google Auth theo yêu cầu.
