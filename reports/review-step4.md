# Review Step 4

## Thay đổi

- Cập nhật `frontend/src/app/[locale]/san-pham/[slug]/page.tsx`.
- Import thêm `useUserStore`.
- Thêm component `StarPicker`.
- Mở rộng `ReviewsPanel`:
  - Kiểm tra user đăng nhập trước khi mở form đánh giá.
  - Form chọn số sao và nhập nội dung.
  - Submit bằng `POST /api/products/<slug>/reviews/`.
  - Review sau khi gửi ở trạng thái chờ duyệt phía backend.
  - Hiển thị lỗi nếu thiếu nội dung, chưa đăng nhập hoặc API trả lỗi.
  - Hiển thị thông báo cảm ơn sau khi gửi thành công.
  - Refetch danh sách review sau khi submit.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
