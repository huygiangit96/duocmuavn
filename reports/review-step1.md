# Review Step 1

## Thay đổi

- Cập nhật `backend/apps/products/serializers.py`.
- Thêm `ProductReviewSerializer` để hiển thị review đã approved:
  - `id`
  - `user_name`
  - `rating`
  - `text`
  - `created_at`
- Thêm `ProductReviewCreateSerializer` để tạo review mới:
  - `rating`
  - `text`
  - Validate `rating` từ 1 đến 5.
- Cập nhật `ProductDetailSerializer`:
  - Thêm computed field `rating`.
  - Thêm computed field `reviews_count`.
  - Chỉ tính review có `status="approved"`.
  - Nếu chưa có review approved, `rating` mặc định là `5.0`.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`.
- Kết quả: không có lỗi.
