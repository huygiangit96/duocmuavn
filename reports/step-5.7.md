# Báo cáo bước 5.7 - Trang Liên Hệ

## Mục tiêu

Xây dựng trang liên hệ `/lien-he` theo prototype `prototype_new/dm-pages.jsx`, giữ inline styles và kết nối form với API public.

## Nội dung đã thực hiện

- Tạo `frontend/src/app/lien-he/page.tsx`.
- Dựng layout 2 cột với class `.contact-grid`:
  - Cột trái: form liên hệ.
  - Cột phải: thông tin liên hệ và bản đồ.
- Form liên hệ dùng `react-hook-form` + `zod`:
  - Họ tên.
  - Email.
  - Số điện thoại.
  - Chủ đề.
  - Nội dung.
- Submit form gọi `POST /api/contact/` public, không cần auth.
- Vì backend `ContactSubmission` hiện chưa có field `subject`, frontend ghép chủ đề vào đầu field `message` khi gửi API.
- Khi gửi thành công:
  - Reset form.
  - Hiển thị thông báo cảm ơn.
- Khi lỗi:
  - Hiển thị thông báo lỗi trong form.
- Cột thông tin gọi `GET /api/config/`:
  - Địa chỉ.
  - Hotline.
  - Email.
  - Zalo URL.
  - Có fallback hardcode nếu backend/config chưa có dữ liệu.
- Bản đồ:
  - Dùng `google_map_embed` từ config nếu có.
  - Fallback sang OpenStreetMap embed.

## Kiểm thử

- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.
- `GET http://localhost:3000/lien-he`: trả về `200 OK`.

## Kết quả

Bước 5.7 đã hoàn thành. Trang `/lien-he` đã có form liên hệ hoạt động, thông tin liên hệ lấy từ config và bản đồ embed theo yêu cầu.
