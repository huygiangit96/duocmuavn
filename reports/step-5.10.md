# Báo cáo bước 5.10 - Trang Admin Dashboard Frontend

## Mục tiêu

Xây dựng khu vực quản trị frontend tại `/quan-tri`, full-screen, không dùng Header/Footer chung, kết nối với Admin API staff-only.

## Nội dung đã thực hiện

- Cập nhật `frontend/src/components/layout/Providers.tsx`:
  - Ẩn Header, Footer, CartDrawer và floating buttons khi route bắt đầu bằng `/quan-tri`.

- Tạo layout riêng cho admin:
  - `frontend/src/app/quan-tri/layout.tsx`
  - `frontend/src/app/quan-tri/AdminShell.tsx`
  - Route guard:
    - Nếu chưa đăng nhập, redirect `/dang-nhap?next=/quan-tri/dashboard`.
    - Gọi `GET /api/admin/stats/` để kiểm tra quyền staff.
    - Nếu API trả `403`, redirect `/dang-nhap`.
  - Sidebar dùng chung:
    - Dashboard.
    - Đơn hàng.
    - Sản phẩm.
    - Tin tức.
    - Tài liệu.
    - Người dùng.
    - Cấu hình.
  - Active state theo route hiện tại.

- Tạo `frontend/src/app/quan-tri/page.tsx`:
  - Redirect về `/quan-tri/dashboard`.

## Dashboard

- Tạo `frontend/src/app/quan-tri/dashboard/page.tsx`.
- Gọi `GET /api/admin/stats/`.
- Hiển thị:
  - Tổng đơn hàng.
  - Doanh thu.
  - Khách hàng.
  - Sản phẩm.
  - Đơn hàng gần đây.
  - Thống kê đơn theo trạng thái bằng bảng/badge/bar text.

## Quản lý đơn hàng

- Tạo `frontend/src/app/quan-tri/don-hang/page.tsx`.
- Gọi `GET /api/admin/orders/`.
- Có filter trạng thái và ô search.
- Bảng đơn hàng hiển thị:
  - Mã đơn.
  - Khách hàng.
  - Ngày đặt.
  - Tổng tiền.
  - Thanh toán.
  - Trạng thái.
- Đổi trạng thái bằng `PATCH /api/admin/orders/<order_number>/status/`.
- Xuất Excel bằng `GET /api/admin/orders/export/`, tải file `orders.xlsx`.

## Quản lý sản phẩm

- Tạo `frontend/src/app/quan-tri/san-pham/page.tsx`.
- Gọi `GET /api/admin/products/`.
- Gọi `GET /api/admin/categories/` để map danh mục.
- Bảng sản phẩm hiển thị:
  - Tên.
  - Giá.
  - Danh mục.
  - Trạng thái.
- Thêm/sửa/xóa sản phẩm qua Admin API:
  - `POST /api/admin/products/`.
  - `PATCH /api/admin/products/<slug>/`.
  - `DELETE /api/admin/products/<slug>/`.

## Các mục sidebar còn lại

- Tạo placeholder route để sidebar không rơi vào 404:
  - `/quan-tri/tin-tuc`
  - `/quan-tri/tai-lieu`
  - `/quan-tri/nguoi-dung`
  - `/quan-tri/cau-hinh`

## Kiểm thử

- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.
- `GET http://localhost:3000/quan-tri/dashboard`: trả về `200 OK`.

## Kết quả

Bước 5.10 đã hoàn thành. Giai đoạn 5 - Các Trang Frontend đã hoàn thành 10/10 bước.
