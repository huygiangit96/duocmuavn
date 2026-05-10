# CMS 5 - Quản Lý Người Dùng

## Thay đổi frontend

- Thay placeholder `frontend/src/app/[locale]/quan-tri/nguoi-dung/page.tsx`.
- Trang người dùng admin hiện có:
  - Fetch `GET /api/admin/users/?page_size=20&page=<page>`.
  - Bảng: email, họ tên, ngày đăng ký, trạng thái active/inactive, quyền Staff/User, tổng đơn hàng, thao tác.
  - Bộ lọc: tất cả, đang hoạt động, bị khóa, staff.
  - Search theo email hoặc tên qua query `search`.
  - Phân trang `page_size=20`.
  - Toggle khóa/mở khóa qua `PATCH /api/admin/users/<id>/toggle-active/`.
  - Optimistic update trạng thái sau mutation.
  - Modal chi tiết user khi click tên, gồm email, tên, ngày tham gia, Firebase UID và 5 đơn hàng gần nhất.

## Thay đổi backend hỗ trợ CMS

- Cập nhật `AdminUserSerializer` trả thêm:
  - `firebase_uid`
  - `order_count`
  - `recent_orders`
- Cập nhật queryset Admin User để prefetch orders/items.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
