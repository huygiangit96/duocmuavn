# CMS 3 - Tin Tức Và Danh Mục Tin Tức

## Thay đổi frontend

- Thay placeholder `frontend/src/app/[locale]/quan-tri/tin-tuc/page.tsx`.
- Trang tin tức admin hiện có:
  - Bảng danh sách từ `GET /api/admin/news/`.
  - Cột: tiêu đề, danh mục, ngày đăng, lượt xem, trạng thái `published/draft`, thao tác sửa/xóa.
  - Form thêm/sửa slide down dưới bảng.
  - Field song ngữ: `title_en`, `summary_en`, `content_en`.
  - Chọn danh mục từ `GET /api/admin/news-categories/`.
  - Chọn hashtag dạng multi-checkbox từ `GET /api/admin/hashtags/`.
  - CRUD qua `POST/PATCH/DELETE /api/admin/news/`.
- Tạo `frontend/src/app/[locale]/quan-tri/danh-muc-tin-tuc/page.tsx`.
  - CRUD `NewsCategory`: `name`, `name_en`, `slug`.
  - API: `GET/POST/PATCH/DELETE /api/admin/news-categories/`.
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Danh mục tin tức` sau `Tin tức`.

## Thay đổi backend hỗ trợ CMS

- `AdminArticleViewSet.perform_create()` tự gán `author=request.user` khi tạo bài viết.
- `AdminArticleSerializer.thumbnail` nhận chuỗi URL để form nhập URL ảnh đại diện.
- `AdminNewsCategoryViewSet.lookup_field = "slug"` để PATCH/DELETE bằng slug.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
