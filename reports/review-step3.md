# Review Step 3

## Thay đổi

- Cập nhật `frontend/src/types/index.ts`.
  - Thêm `Product.rating`.
  - Thêm `Product.reviews_count`.
- Cập nhật `frontend/src/app/[locale]/san-pham/[slug]/page.tsx`.
  - Thêm interface `ReviewItem`.
  - Cập nhật `productReviews()` ưu tiên `reviews_count`.
  - Thay placeholder `ReviewsPanel` bằng panel thật:
    - Fetch `GET /api/products/<slug>/reviews/?page=<page>&page_size=5`.
    - Hiển thị rating summary.
    - Hiển thị breakdown 5 sao đến 1 sao.
    - Hiển thị danh sách review approved.
    - Có nút `Xem thêm đánh giá`.
  - Cập nhật nơi gọi `<ReviewsPanel product={product} slug={slug} />`.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
