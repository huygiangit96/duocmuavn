# Báo cáo bước 5.6 - Trang Tài Liệu

## Mục tiêu

Xây dựng trang danh sách tài liệu và trang chi tiết tài liệu/video theo prototype `prototype_new/dm-pages.jsx`, giữ inline styles và kết nối API backend.

## Nội dung đã thực hiện

- Tạo trang danh sách tài liệu: `frontend/src/app/tai-lieu/page.tsx`
  - Gọi `GET /api/documents/` bằng React Query.
  - Hỗ trợ filter `doc_type`, `category`, `plants`, `search`, `page`.
  - Đồng bộ filter với URL bằng `useSearchParams()` và `useRouter()`.
  - Thêm tabs chuyển giữa `Tài Liệu Giấy` và `Video Hướng Dẫn`.
  - Gọi `GET /api/document-categories/` để lọc danh mục.
  - Gọi `GET /api/plants/` để lọc theo cây trồng.
  - Thêm pagination và empty/error/loading states.

- Tạo trang chi tiết tài liệu: `frontend/src/app/tai-lieu/[slug]/page.tsx`
  - Gọi `GET /api/documents/<slug>/`.
  - Nếu `doc_type=paper`: hiển thị nút xem tài liệu và tải PDF khi có file.
  - Nếu `doc_type=video`: nhúng video bằng YouTube embed/player khi có `video_url`.
  - Render nội dung HTML từ field `content`.
  - Xử lý 404 bằng redirect về `/tai-lieu`.

- Bổ sung backend endpoint danh mục tài liệu:
  - Thêm `DocCategoryListView` trong `backend/apps/documents/views.py`.
  - Thêm route public `GET /api/document-categories/` trong `backend/apps/documents/urls.py`.

- Bổ sung icon frontend còn thiếu:
  - `FileText`, `Video`, `Play`, `Download` trong `frontend/src/components/icons.tsx`.

## Kiểm thử

- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.
- `python backend/manage.py check`: thành công.
- `python backend/manage.py makemigrations --check --dry-run`: không có migration mới.
- `GET http://localhost:3000/tai-lieu`: trả về `200 OK`.

## Kết quả

Bước 5.6 đã hoàn thành. Frontend hiện có trang `/tai-lieu` và `/tai-lieu/[slug]`, hỗ trợ tài liệu giấy/video, filter URL, pagination và kết nối API backend.
