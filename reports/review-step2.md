# Review Step 2

## Thay đổi

- Cập nhật `backend/apps/products/views.py`.
- Thêm `ProductReviewListCreateView`:
  - `GET /api/products/<slug>/reviews/` trả review đã approved.
  - `POST /api/products/<slug>/reviews/` yêu cầu user đăng nhập.
  - Review mới được lưu với `status=pending`.
  - Chặn user đánh giá cùng một sản phẩm nhiều lần.
- Cập nhật `backend/apps/products/urls.py`.
- Thêm route `products/<slug:slug>/reviews/` trước route detail `products/<slug:slug>/`.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`.
- Kết quả: không có lỗi.
