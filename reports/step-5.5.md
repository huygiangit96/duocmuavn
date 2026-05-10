# Báo cáo bước 5.5 - Trang Tin Tức

## Mục tiêu

Xây dựng trang danh sách tin tức và trang chi tiết bài viết theo prototype `prototype_new/dm-pages.jsx`, giữ phong cách inline styles/CSS variables của giao diện prototype.

## Nội dung đã thực hiện

- Tạo trang danh sách tin tức: `frontend/src/app/tin-tuc/page.tsx`
  - Gọi `GET /api/news/` bằng React Query.
  - Hỗ trợ filter `category`, `search`, `page`.
  - Đồng bộ filter với URL bằng `useSearchParams()` và `useRouter()`.
  - Gọi `GET /api/news-categories/` để hiện danh mục filter.
  - Hiển thị danh sách bài viết bằng grid class `.news-2up`.
  - Thêm pagination dưới danh sách.
  - Xử lý loading, lỗi API và empty state.

- Tạo trang chi tiết tin tức: `frontend/src/app/tin-tuc/[slug]/page.tsx`
  - Gọi `GET /api/news/<slug>/` bằng React Query.
  - Hiển thị ảnh đại diện, tiêu đề, ngày đăng, lượt xem, tóm tắt, hashtag và nội dung HTML từ field `content`.
  - Sidebar gọi `GET /api/news/?page_size=5` để hiện bài viết mới nhất.
  - Xử lý 404 bằng redirect về `/tin-tuc`.

- Bổ sung API danh mục tin tức cho frontend:
  - Thêm `NewsCategoryListView` trong `backend/apps/news/views.py`.
  - Thêm route public `GET /api/news-categories/` trong `backend/apps/news/urls.py`.

## Kiểm thử

- `npm run lint`: thành công.
- `npm run build`: thành công, không có lỗi TypeScript.
- `python backend/manage.py check`: thành công.
- `python backend/manage.py makemigrations --check --dry-run`: không có migration mới.
- `GET http://localhost:3000/tin-tuc`: trả về `200 OK`.

## Kết quả

Bước 5.5 đã hoàn thành. Frontend hiện có trang danh sách tin tức `/tin-tuc` và trang chi tiết `/tin-tuc/[slug]`, kết nối với API backend và giữ thiết kế theo prototype.
