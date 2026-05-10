# CMS 4 - Tài Liệu Và Danh Mục Tài Liệu

## Thay đổi frontend

- Thay placeholder `frontend/src/app/[locale]/quan-tri/tai-lieu/page.tsx`.
- Trang tài liệu admin hiện có:
  - Bảng danh sách từ `GET /api/admin/documents/`.
  - Cột: tiêu đề, loại `paper/video`, danh mục, cây trồng, ngày tạo, trạng thái, thao tác sửa/xóa.
  - Form thêm/sửa với nhóm `Thông tin cơ bản` và `Nội dung & File`.
  - Chọn danh mục từ `GET /api/admin/document-categories/`.
  - Chọn cây trồng từ `GET /api/admin/plants/`.
  - Field song ngữ: `title_en`, `summary_en`, `content_en`.
  - Nếu `doc_type=paper`, hiện `file_url`.
  - Nếu `doc_type=video`, hiện `video_url`.
- Tạo `frontend/src/app/[locale]/quan-tri/danh-muc-tai-lieu/page.tsx`.
  - CRUD `DocCategory`: `name`, `name_en`, `slug`.
  - API: `GET/POST/PATCH/DELETE /api/admin/document-categories/`.
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Danh mục tài liệu` sau `Tài liệu`.

## Thay đổi backend hỗ trợ CMS

- `AdminDocumentSerializer` nhận alias `file_url` map vào field `file`.
- `AdminDocCategoryViewSet.lookup_field = "slug"` để PATCH/DELETE danh mục tài liệu bằng slug.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
