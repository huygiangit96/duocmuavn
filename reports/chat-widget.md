# Chat Widget

## Thay đổi frontend

- Tạo `frontend/src/components/ChatWidget.tsx`.
- UI copy theo prototype `ChatWidget`:
  - Floating button góc phải.
  - Badge unread.
  - Popup chat với header CSKH, messages, typing indicator, quick replies và input.
  - Inline styles và keyframes `chatSlide`, `dotBounce`.
- ChatWidget gửi tin nhắn thật đến backend:
  - `POST ${NEXT_PUBLIC_API_URL}/contact/`
  - Payload: `name`, `email`, `message`.
  - Hiển thị phản hồi thành công/lỗi trong khung chat.
- Cập nhật `frontend/src/components/layout/Providers.tsx`:
  - Import và render `<ChatWidget />` cho website public, không hiện trong admin.
  - Fetch `${NEXT_PUBLIC_API_URL}/config/` để lấy `hotline` và `zalo_url`.
  - Phone button dùng `tel:${hotline}`.
  - Zalo button dùng `zalo_url`.

## Thay đổi backend

- Kiểm tra `ContactSubmissionCreateView`: đã dùng `AllowAny`.
- Cập nhật `ContactSubmissionSerializer` để `phone` không bắt buộc.
- `POST /api/contact/` nhận được `name`, `email`, `message` và lưu thành công mà không yêu cầu đăng nhập.

## Kiểm tra

- Đã chạy `venv\Scripts\python.exe backend/manage.py check`: không có lỗi.
- Đã chạy `npm run build` trong `frontend/`: build thành công, không có lỗi TypeScript.
