# Báo cáo Bước 5.3 - Trang Chi Tiết Sản Phẩm

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã cập nhật route chi tiết sản phẩm:

- `frontend/src/app/san-pham/[slug]/page.tsx`

## Chi tiết

Trang chi tiết sản phẩm hiện dùng React Query để gọi:

- `GET /api/products/<slug>/`
- `GET /api/products/?category=<category_slug>&page_size=4` cho sản phẩm liên quan

UI được dựng theo cấu trúc `ProductDetailPage` trong `prototype_new/dm-pages.jsx`, giữ inline styles:

- Breadcrumb: Trang chủ / Sản phẩm / Tên sản phẩm
- Gallery ảnh:
  - ảnh chính
  - thumbnail nhỏ bên dưới
  - fallback SVG ProductImg nếu chưa có ảnh
- Thông tin sản phẩm:
  - tag badge
  - danh mục
  - tên sản phẩm
  - Stars + số đánh giá
  - giá bán
  - giá gốc gạch ngang và badge giảm giá nếu có `sale_price`
  - cây trồng liên quan
- Chọn số lượng:
  - tăng
  - giảm
- Hành động:
  - `Thêm vào giỏ`: gọi `useCartStore.addItem({ product, quantity })` và hiện toast
  - `Đặt ngay`: thêm vào giỏ rồi redirect `/thanh-toan`
- Tabs:
  - Mô Tả Sản Phẩm
  - Thông Số
  - Đánh Giá
- Section sản phẩm liên quan dùng `ProductCard`.

## Loading và not-found

- Có loading state `Đang tải sản phẩm...`.
- Nếu backend trả `404`, trang redirect về `/san-pham`.
- Nếu không có dữ liệu, hiển thị thông báo `Không tìm thấy sản phẩm.`

## Kiểm thử

Đã chạy:

```powershell
npm run lint
npm run build
```

Kết quả:

- ESLint pass.
- Build pass.
- TypeScript không lỗi.
- Route `/san-pham/[slug]` được build dạng dynamic route.

Đã kiểm tra HTTP:

```powershell
Invoke-WebRequest http://localhost:3000/san-pham/test-slug
```

Kết quả:

- Frontend trả `200`.
- Trang render shell chi tiết/loading/not-found hợp lệ.

Backend test slug:

- `GET http://localhost:8000/api/products/test-slug/` trả `404`, đúng luồng redirect/not-found.

## Kết luận

Bước 5.3 đã hoàn thành. Trang chi tiết sản phẩm đã có API detail, gallery, thông tin giá, quantity selector, add-to-cart, buy-now, tabs và sản phẩm liên quan.
