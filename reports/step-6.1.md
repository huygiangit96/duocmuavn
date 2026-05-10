# Báo cáo bước 6.1 - Tích hợp VNPay sandbox

## Mục tiêu

Tích hợp thanh toán VNPay sandbox cho backend và kết nối luồng checkout frontend.

## Nội dung đã thực hiện

- Kiểm tra dependency backend:
  - `requests==2.33.1` đã có sẵn trong `backend/requirements.txt`, không cần cài thêm.

- Tạo app mới `apps.payments`:
  - `backend/apps/payments/__init__.py`
  - `backend/apps/payments/apps.py`
  - `backend/apps/payments/urls.py`
  - `backend/apps/payments/views.py`
  - `backend/apps/payments/vnpay.py`

- Cập nhật backend settings/router:
  - Thêm `apps.payments` vào `INSTALLED_APPS`.
  - Include `apps.payments.urls` vào `/api/`.
  - Thêm `FRONTEND_URL`.

- Tạo helper VNPay:
  - `create_payment_url(order_number, amount, order_info, return_url, ip_addr)`
  - `verify_return(params)`
  - Dùng sandbox URL `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.
  - Đọc `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` từ biến môi trường bằng `python-decouple`.
  - Tạo chữ ký `vnp_SecureHash` bằng HMAC-SHA512.

- Tạo API thanh toán:
  - `POST /api/payments/vnpay/create/`
    - Yêu cầu đăng nhập.
    - Nhận `order_number`.
    - Kiểm tra đơn hàng thuộc user hiện tại.
    - Trả về `{ "payment_url": "..." }`.
  - `GET /api/payments/vnpay/return/`
    - Public endpoint cho VNPay redirect.
    - Verify chữ ký callback.
    - Nếu hợp lệ và `vnp_ResponseCode=00`, cập nhật `Order.payment_status = paid`.
    - Redirect về frontend:
      - `/thanh-toan/xac-nhan?order=<order_number>&status=success`
      - hoặc `status=failed`.

- Cập nhật `backend/.env`:
  - `FRONTEND_URL=http://localhost:3000`
  - `VNPAY_TMN_CODE=<sandbox_tmn_code>`
  - `VNPAY_HASH_SECRET=<sandbox_secret>`

- Cập nhật checkout frontend:
  - Bỏ disabled cho VNPay.
  - Cho phép chọn `COD` hoặc `VNPay`.
  - Khi chọn VNPay:
    - Tạo đơn hàng bằng `POST /api/orders/`.
    - Gọi `POST /api/payments/vnpay/create/`.
    - Redirect người dùng sang URL VNPay sandbox.
  - Trang xác nhận đọc `?status=` để hiển thị kết quả thanh toán thành công/thất bại.

## Lưu ý cấu hình

Hiện `backend/.env` đang dùng placeholder cho VNPay. Trước khi test thanh toán sandbox thật, cần thay:

- `VNPAY_TMN_CODE=<sandbox_tmn_code>`
- `VNPAY_HASH_SECRET=<sandbox_secret>`

bằng thông tin sandbox thật từ VNPay.

## Kiểm thử

- `python backend/manage.py check`: thành công.
- `python backend/manage.py makemigrations --check --dry-run`: không có migration mới.
- `npm run build`: thành công, không có lỗi TypeScript.
- `npm run lint`: thành công.

## Kết quả

Bước 6.1 đã hoàn thành. Hệ thống đã có luồng tạo URL thanh toán VNPay sandbox và xử lý return callback để cập nhật trạng thái thanh toán.
