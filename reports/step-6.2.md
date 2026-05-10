# Báo cáo bước 6.2 - Tích hợp MoMo sandbox

## Mục tiêu

Tích hợp thanh toán MoMo sandbox bằng Capture Wallet API và kết nối với checkout frontend.

## Nội dung đã thực hiện

- Tạo helper MoMo: `backend/apps/payments/momo.py`
  - Dùng endpoint sandbox `https://test-payment.momo.vn/v2/gateway/api/create`.
  - Đọc biến môi trường:
    - `MOMO_PARTNER_CODE`
    - `MOMO_ACCESS_KEY`
    - `MOMO_SECRET_KEY`
  - Tạo chữ ký HMAC-SHA256 theo raw signature của MoMo.
  - Gọi MoMo API bằng `requests.post`.
  - Trả về `payUrl` hoặc fallback `deeplink`/`qrCodeUrl`.
  - Thêm `verify_ipn(params)` để xác minh callback IPN.

- Cập nhật `backend/apps/payments/views.py`
  - `POST /api/payments/momo/create/`
    - Yêu cầu đăng nhập.
    - Nhận `order_number`.
    - Kiểm tra đơn hàng thuộc user hiện tại.
    - Gọi helper MoMo để lấy payment URL.
    - Trả về `{ "payment_url": "..." }`.
  - `POST /api/payments/momo/ipn/`
    - Public endpoint cho MoMo IPN.
    - Verify chữ ký.
    - Nếu `resultCode=0`, cập nhật `Order.payment_status = paid`.
    - Trả HTTP 204.
  - `GET /api/payments/momo/return/`
    - Public endpoint redirect sau thanh toán.
    - Redirect về `/thanh-toan/xac-nhan?order=<order_number>&status=success|failed`.

- Cập nhật `backend/apps/payments/urls.py`
  - Thêm route MoMo create, IPN và return.

- Cập nhật `backend/.env`
  - `MOMO_PARTNER_CODE=<sandbox_partner_code>`
  - `MOMO_ACCESS_KEY=<sandbox_access_key>`
  - `MOMO_SECRET_KEY=<sandbox_secret_key>`

- Cập nhật checkout frontend: `frontend/src/app/thanh-toan/page.tsx`
  - Bỏ disabled cho MoMo.
  - Cho phép chọn `COD`, `VNPay`, `MoMo`.
  - Khi chọn MoMo:
    - Tạo đơn hàng bằng `POST /api/orders/`.
    - Gọi `POST /api/payments/momo/create/`.
    - Redirect người dùng sang URL thanh toán MoMo.

## Lưu ý cấu hình

Hiện `backend/.env` đang dùng placeholder cho MoMo. Trước khi test sandbox thật, cần thay:

- `MOMO_PARTNER_CODE=<sandbox_partner_code>`
- `MOMO_ACCESS_KEY=<sandbox_access_key>`
- `MOMO_SECRET_KEY=<sandbox_secret_key>`

bằng thông tin sandbox thật từ MoMo.

## Kiểm thử

- `python backend/manage.py check`: thành công.
- `python backend/manage.py makemigrations --check --dry-run`: không có migration mới.
- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.

## Kết quả

Bước 6.2 đã hoàn thành. Giai đoạn 6 - Thanh Toán đã hoàn thành 2/2 bước.
