# CMS 2 - Danh Mục Và Cây Trồng

## Thay đổi frontend

- Tạo `frontend/src/app/[locale]/quan-tri/danh-muc/page.tsx`.
  - List danh mục từ `GET /api/admin/categories/`.
  - Form thêm/sửa: `name`, `name_en`, `slug`, `description`, `description_en`, `color`, `icon`.
  - Thêm/sửa/xóa qua Admin API, xóa có confirm dialog.
- Tạo `frontend/src/app/[locale]/quan-tri/cay-trong/page.tsx`.
  - List cây trồng từ `GET /api/admin/plants/`.
  - Form thêm/sửa: `name`, `name_en`, `slug`.
  - Thêm/sửa/xóa qua Admin API.
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Danh mục SP`.
  - Thêm `Cây trồng`.

## Thay đổi backend hỗ trợ CMS

- Bổ sung `Category.description`.
- Tạo và áp dụng migration `products.0004_category_description`.
- Cập nhật Admin API:
  - `AdminCategoryViewSet.lookup_field = "slug"`.
  - `AdminPlantViewSet.lookup_field = "slug"`.
  - `AdminCategorySerializer` trả thêm `product_count`.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py migrate products`.
- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
- Đã kiểm tra serializer danh mục trả được `product_count`.
