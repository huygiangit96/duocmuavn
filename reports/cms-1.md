# CMS 1 - Cập Nhật Form Sản Phẩm Admin

## Thay đổi

- Cập nhật `frontend/src/app/[locale]/quan-tri/san-pham/page.tsx`.
- Bổ sung interface `AdminProduct` với `plants`, `images`, mô tả, thông số và các field tiếng Anh.
- Bổ sung interface `ProductForm` với plants dạng string array, mô tả, hướng dẫn, field tiếng Anh và danh sách URL ảnh.
- Form sản phẩm đã chia thành 3 tab:
  - Thông tin cơ bản
  - Mô tả
  - Hình ảnh & Thông số
- Gọi thêm `GET /api/admin/plants/` để hiển thị checkbox cây trồng.
- Bảng sản phẩm hiển thị thêm tên danh mục và tên cây trồng.
- Nút xóa có confirm: `Xác nhận xóa sản phẩm <tên>?`

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.

## Ghi chú

- Frontend đã gửi `images` array từ danh sách URL ảnh khi lưu sản phẩm.
- Backend admin serializer hiện đang dùng model fields của `Product`; nếu cần lưu URL ảnh vào `ProductImage`, nên bổ sung write serializer riêng cho ảnh ở backend.
