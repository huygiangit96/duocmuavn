# Fix Login Redirect

## Thay đổi

- Cập nhật `frontend/src/app/[locale]/dang-nhap/page.tsx`.
- Sau khi đăng nhập Firebase thành công bằng email/password hoặc Google:
  - Lấy Firebase ID token bằng `user.getIdToken()`.
  - Gọi `GET /api/admin/stats/` với header `Authorization: Bearer <token>`.
  - Nếu API trả `200`, redirect đến `/quan-tri/dashboard`.
  - Nếu API trả `403` hoặc lỗi khác, redirect về `?next=` hoặc `/`.
- Thêm màn hình loading spinner nhỏ trong lúc kiểm tra quyền staff.
- Không thay đổi luồng đăng ký.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
- Ghi chú: Next.js vẫn hiển thị warning hiện có về convention `middleware` deprecated sang `proxy`.
