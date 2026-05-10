# CMS 9 - Quản Lý Liên Hệ

## Thay đổi frontend

- Tạo `frontend/src/app/[locale]/quan-tri/lien-he/page.tsx`.
- Trang liên hệ admin hiện có:
  - Fetch `GET /api/admin/contacts/`.
  - Bảng: họ tên, email, số điện thoại, nội dung rút gọn 80 ký tự, ngày gửi, trạng thái đã đọc.
  - Search theo email, tên, số điện thoại hoặc nội dung.
  - Sắp xếp mặc định: ngày mới nhất trước.
  - Click vào dòng mở drawer bên phải.
  - Drawer hiển thị đầy đủ họ tên, email, SĐT, nội dung, ngày giờ gửi.
  - Toggle xử lý bằng `PATCH /api/admin/contacts/<id>/` với `is_read`.
- Cập nhật `AdminTable` hỗ trợ prop `onRowClick`.
- Cập nhật sidebar `AdminShell.tsx`:
  - Thêm `Liên hệ` ở cuối.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
