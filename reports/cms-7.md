# CMS 7 - Quản Lý Khuyến Mãi

## Thay đổi frontend

- Tạo `frontend/src/app/[locale]/quan-tri/khuyen-mai/page.tsx`.
- Trang khuyến mãi admin hiện có:
  - Fetch `GET /api/admin/promotions/`.
  - Bảng: mã, loại giảm, giá trị, đơn tối thiểu, hiệu lực, trạng thái, thao tác.
  - Form thêm/sửa:
    - `code` tự uppercase.
    - `discount_type`: `percent` hoặc `fixed`.
    - `value`, `min_order_value`, `valid_from`, `valid_to`, `max_uses`, `is_active`.
  - CRUD:
    - `POST /api/admin/promotions/`
    - `PATCH /api/admin/promotions/<id>/`
    - `DELETE /api/admin/promotions/<id>/`
  - Xóa có confirm dialog.
  - Badge trạng thái:
    - Đang hoạt động
    - Hết hạn
    - Chưa bắt đầu
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Khuyến mãi`.

## Ghi chú mapping API

- Form dùng tên field theo CMS: `value`, `valid_from`, `valid_to`, `max_uses`.
- Khi gửi API, frontend map sang model backend:
  - `value` -> `discount_value`
  - `valid_from` -> `start_date`
  - `valid_to` -> `end_date`
  - `max_uses` -> `usage_limit`
- Field `name` của backend tự lấy bằng mã khuyến mãi.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
