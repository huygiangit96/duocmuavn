# Account Dropdown

## Thay đổi

- Cập nhật `frontend/src/components/layout/Header.tsx`.
- Khi user đã đăng nhập:
  - Hover icon tài khoản sẽ mở dropdown.
  - Dropdown gồm:
    - Hồ sơ -> `/tai-khoan`
    - Đơn hàng -> `/tai-khoan/don-hang`
    - Đăng xuất -> `signOut(auth)` rồi chuyển về `/dang-nhap`
  - Có delay đóng 120ms để hover mượt hơn.
- Khi user chưa đăng nhập:
  - Giữ hành vi cũ, click icon dẫn tới `/dang-nhap`.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
