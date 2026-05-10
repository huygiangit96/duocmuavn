# Báo cáo bước 5.9 - Trang Tài Khoản

## Mục tiêu

Xây dựng trang tài khoản `/tai-khoan` theo prototype `prototype_new/dm-pages.jsx`, có route guard đăng nhập và các tab quản lý hồ sơ, đơn hàng, địa chỉ.

## Nội dung đã thực hiện

- Tạo `frontend/src/app/tai-khoan/page.tsx`.
- Bảo vệ route:
  - Nếu chưa đăng nhập, redirect về `/dang-nhap?next=/tai-khoan`.
  - Nút đăng xuất gọi `signOut(auth)`, clear `useUserStore`, redirect `/`.
- Layout theo prototype:
  - Sidebar trái với avatar, tên, email, menu tab.
  - Nội dung phải thay đổi theo tab.
  - Giữ inline styles và class `.account-grid`.

## Tab Hồ Sơ

- Gọi `GET /api/account/profile/`.
- Form cập nhật:
  - Họ tên.
  - Số điện thoại.
  - Email hiển thị read-only.
- Submit `PUT /api/account/profile/`.
- Hiển thị toast thành công sau khi lưu.

## Tab Đơn Hàng

- Gọi `GET /api/orders/`.
- Hiển thị danh sách đơn hàng:
  - Mã đơn.
  - Ngày đặt.
  - Trạng thái.
  - Danh sách sản phẩm.
  - Tổng tiền.
- Click `Chi tiết` để mở màn chi tiết đơn hàng.
- Nút `Hủy đơn` cho đơn `pending`, gọi `POST /api/orders/<order_number>/cancel/`.
- Sau khi hủy, invalidate query và cập nhật lại danh sách.

## Tab Địa Chỉ

- Gọi `GET /api/account/addresses/`.
- Hiển thị danh sách địa chỉ đã lưu.
- Form thêm/sửa địa chỉ:
  - Nhãn địa chỉ.
  - Người nhận.
  - Số điện thoại.
  - Tỉnh/TP từ `GET /api/provinces/`.
  - Xã/Phường từ `GET /api/communes/?province=<id>`.
  - Địa chỉ cụ thể.
  - Đánh dấu mặc định.
- Thêm địa chỉ gọi `POST /api/account/addresses/`.
- Sửa địa chỉ gọi `PUT /api/account/addresses/<id>/`.
- Xóa địa chỉ gọi `DELETE /api/account/addresses/<id>/`.

## Kiểm thử

- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.
- `GET http://localhost:3000/tai-khoan`: trả về `200 OK`.

## Kết quả

Bước 5.9 đã hoàn thành. Trang `/tai-khoan` hiện có quản lý hồ sơ, đơn hàng, địa chỉ và đăng xuất theo yêu cầu.
