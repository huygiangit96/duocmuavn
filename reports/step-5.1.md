# Báo cáo Bước 5.1 - Trang Chủ

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã xây dựng trang chủ `/` tại:

- `frontend/src/app/page.tsx`

Đã tạo component tái sử dụng:

- `frontend/src/components/ProductCard.tsx`

Đã bổ sung type:

- `Banner` trong `frontend/src/types/index.ts`

Đã copy asset fallback:

- `frontend/public/logo.png`

## Nội dung trang chủ

### Banner section

- Gọi `GET /api/banners/` bằng React Query.
- Nếu endpoint chưa có hoặc backend chưa chạy, dùng fallback banner tĩnh với logo Được Mùa.
- CTA chính link đến `/san-pham`.
- CTA tư vấn link đến `/lien-he`.

Ghi chú: backend hiện chưa có public endpoint `/api/banners/`; trang đã xử lý lỗi bằng fallback.

### Sản phẩm nổi bật

- Gọi `GET /api/products/?ordering=-sale_count&page_size=8`.
- Hiển thị grid sản phẩm bằng `ProductCard`.
- Mỗi card có:
  - ảnh hoặc fallback visual
  - tên sản phẩm
  - danh mục
  - giá / giá khuyến mãi
  - nút thêm giỏ hàng dùng `useCartStore.addItem`

### Danh mục

- Gọi `GET /api/categories/`.
- Hiển thị card danh mục.
- Click link đến `/san-pham?category=<slug>`.

### Tin tức mới nhất

- Gọi `GET /api/news/?page_size=3`.
- Hiển thị 3 bài dạng card ngang.
- Có fallback khi backend chưa chạy.

### CTA giữa/cuối trang

- Hardcode CTA tư vấn kỹ thuật.
- Gọi `GET /api/config/` để lấy hotline nếu backend có dữ liệu.
- Fallback hotline: `1800 xxxx`.

## Kiểm thử

Đã chạy:

```powershell
npm run build
npm run lint
```

Kết quả:

- Build pass.
- TypeScript không lỗi.
- ESLint không lỗi.

Đã kiểm tra dev server:

```powershell
Invoke-WebRequest http://localhost:3000
```

Kết quả:

- HTTP status: `200`
- HTML có section `Sản phẩm nổi bật`.
- HTML có CTA `Cần tư vấn kỹ thuật`.

Kiểm tra backend:

- `http://localhost:8000/api/products/?ordering=-sale_count&page_size=8`: backend chưa chạy, không kết nối được.
- `http://localhost:8000/api/banners/`: backend chưa chạy, không kết nối được.

Vì vậy lần kiểm tra hiện tại xác nhận trang render đúng bằng fallback graceful.

## Kết luận

Bước 5.1 đã hoàn thành. Trang chủ đã có banner, danh mục, sản phẩm nổi bật, tin tức mới nhất, CTA tư vấn và component `ProductCard` tái sử dụng.
