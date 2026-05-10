# Báo cáo Bước 5.2 - Trang Danh Sách Sản Phẩm

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã tạo trang danh sách sản phẩm:

- `frontend/src/app/san-pham/page.tsx`

Đã tạo component phân trang:

- `frontend/src/components/Pagination.tsx`

Đã tạo placeholder cho trang chi tiết để route build không lỗi:

- `frontend/src/app/san-pham/[slug]/page.tsx`

## Chi tiết

### UI

- Tham khảo `ProductsPage` trong `prototype_new/dm-pages.jsx`.
- Giữ cấu trúc inline styles chính:
  - top bar tiêu đề + search + sort
  - sidebar filter sticky
  - mobile filter drawer
  - grid sản phẩm
  - empty state
  - pagination dưới grid
- Grid dùng lại `ProductCard` đã làm lại theo prototype.

### API

Trang gọi các endpoint:

- `GET /api/products/`
- `GET /api/categories/`
- `GET /api/plants/`

Hỗ trợ URL params:

- `category`
- `plant`
- `search`
- `ordering`
- `page`

Mapping sang backend:

- URL `plant=<slug>` được gửi tới backend thành `plants=<slug>` vì `ProductFilter` backend đang dùng field `plants`.
- `page_size=20` được gửi cố định.

### URL sync

- Dùng `useSearchParams()` để đọc query params.
- Dùng `useRouter()` để cập nhật URL khi:
  - chọn danh mục
  - chọn cây trồng
  - đổi sắp xếp
  - nhập search và nhấn Enter
  - chuyển trang
  - xóa bộ lọc

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
- Route `/san-pham` được generate thành static route.
- Route `/san-pham/[slug]` build thành dynamic route placeholder.

Đã kiểm tra dev server:

```powershell
Invoke-WebRequest "http://localhost:3000/san-pham?search=test&ordering=-sale_count&page=1"
```

Kết quả:

- HTTP status: `200`
- HTML có `Sản Phẩm`.
- HTML có sidebar `Danh Mục`.

Ghi chú: backend `localhost:8000` hiện chưa chạy, nên số liệu sản phẩm thật chưa được xác minh trong lần test này.

## Kết luận

Bước 5.2 đã hoàn thành. Trang danh sách sản phẩm đã có filter theo danh mục/cây trồng, search, ordering, pagination, URL sync và placeholder route chi tiết cho Bước 5.3.
