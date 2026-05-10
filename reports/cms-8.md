# CMS 8 - Quản Lý Đánh Giá

## Thay đổi frontend

- Tạo `frontend/src/app/[locale]/quan-tri/danh-gia/page.tsx`.
- Trang đánh giá admin hiện có:
  - Fetch `GET /api/admin/reviews/`.
  - Bảng: sản phẩm, người dùng, sao, nội dung, ngày gửi, trạng thái, thao tác.
  - Filter trạng thái:
    - Tất cả
    - Chờ duyệt
    - Đã duyệt
    - Từ chối
  - Search theo tên sản phẩm hoặc nội dung đánh giá.
  - Sao hiển thị bằng `★` màu vàng và `☆` màu xám.
  - Badge trạng thái:
    - `pending`: Chờ duyệt, màu cam
    - `approved`: Đã duyệt, màu xanh lá
    - `rejected`: Từ chối, màu đỏ
  - Hành động:
    - `PATCH /api/admin/reviews/<id>/approve/`
    - `PATCH /api/admin/reviews/<id>/reject/`
  - Sau mutation, invalidate query để badge cập nhật.
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Đánh giá` sau `Đơn hàng`.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
