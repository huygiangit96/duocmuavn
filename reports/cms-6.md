# CMS 6 - Cấu Hình Website Và Banner

## Thay đổi frontend

- Thay placeholder `frontend/src/app/[locale]/quan-tri/cau-hinh/page.tsx`.
- Trang cấu hình admin hiện có 2 section dạng tab:
  - Cấu hình Website
  - Quản lý Banner
- Section Cấu hình Website:
  - Fetch `GET /api/admin/site-config/`, lấy bản ghi đầu tiên.
  - Form inline cho `hotline`, `email`, `address`, `zalo_url`, `google_map_embed`, `tagline`, `tagline_en`, `about`, `about_en`.
  - Lưu bằng `PATCH /api/admin/site-config/<id>/`.
  - Có toast thành công/thất bại.
- Section Quản lý Banner:
  - Fetch `GET /api/admin/banners/`.
  - Bảng: tiêu đề, tiêu đề EN, preview ảnh, thứ tự, trạng thái active, thao tác.
  - Form thêm/sửa: `title`, `title_en`, `subtitle`, `subtitle_en`, `image_url`, `link_url`, `sort_order`, `is_active`.
  - Preview ảnh ngay cạnh input `image_url`.
  - CRUD qua `POST/PATCH/DELETE /api/admin/banners/`.
  - Xóa có confirm dialog.

## Thay đổi backend hỗ trợ CMS

- Bổ sung `SiteConfig.tagline` và `SiteConfig.about`.
- Tạo và áp dụng migration `contact.0004_siteconfig_about_siteconfig_tagline`.
- Cập nhật `AdminBannerSerializer` nhận alias:
  - `image_url` -> `image`
  - `link_url` -> `link`
  - `sort_order` -> `order`
- Cập nhật `AdminSiteConfigSerializer` hỗ trợ `tagline`, `about`, `tagline_en`, `about_en`.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py migrate contact`.
- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
