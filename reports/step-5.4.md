# Báo cáo Bước 5.4 - Trang Checkout

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã tạo trang checkout:

- `frontend/src/app/thanh-toan/page.tsx`

Đã tạo trang xác nhận đơn hàng:

- `frontend/src/app/thanh-toan/xac-nhan/page.tsx`

Đã bổ sung helper frontend:

- `dmOutline`
- icon `ChevL`

Đã bổ sung API hành chính đọc dữ liệu đã import:

- `GET /api/provinces/`
- `GET /api/communes/?province=<id>`

File backend cập nhật:

- `backend/apps/accounts/views.py`
- `backend/apps/accounts/urls.py`

## UI Checkout

Trang checkout tham khảo `CheckoutPage` trong `prototype_new/dm-pages.jsx` và giữ inline styles:

- Layout 2 cột với class `.checkout-grid`
- Step indicator:
  - Giao hàng
  - Thanh toán
  - Xác nhận
- Form bên trái
- Tóm tắt đơn hàng bên phải

## Form giao hàng

Dùng `react-hook-form` + `zod` để validate:

- Họ tên
- Số điện thoại
- Tỉnh/thành
- Xã/phường
- Địa chỉ cụ thể
- Ghi chú

Dropdown:

- Tỉnh/thành gọi `GET /api/provinces/`
- Xã/phường gọi `GET /api/communes/?province=<id>` sau khi chọn tỉnh

## Thanh toán

Phương thức thanh toán:

- COD: mặc định và đang bật
- VNPay: disabled, nhãn `Sắp ra mắt`
- MoMo: disabled, nhãn `Sắp ra mắt`

## Tóm tắt đơn hàng

Đọc sản phẩm từ `useCartStore`.

Logic phí ship khớp backend:

- Subtotal >= `500000`: miễn phí
- Subtotal < `500000`: `30000`

Hiển thị:

- Danh sách sản phẩm
- Tạm tính
- Phí ship
- Tổng cộng

## Đặt hàng

Nút `Đặt Hàng`:

- Nếu chưa đăng nhập: redirect `/dang-nhap?next=/thanh-toan`
- Gọi `POST /api/orders/`
- Payload gồm:
  - `payment_method: cod`
  - `receiver_name`
  - `receiver_phone`
  - `receiver_address`
  - `note`
  - `items`
- Thành công:
  - `clearCart()`
  - hiện toast
  - redirect `/thanh-toan/xac-nhan?order=<order_number>`
- Lỗi:
  - hiển thị thông báo lỗi từ API

## Kiểm thử

Frontend:

```powershell
npm run lint
npm run build
```

Kết quả:

- ESLint pass.
- Build pass.
- TypeScript không lỗi.
- Routes build thành công:
  - `/thanh-toan`
  - `/thanh-toan/xac-nhan`

Backend:

```powershell
venv\Scripts\python.exe backend/manage.py check
venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
```

Kết quả:

- Django check không có lỗi.
- Không có migration mới.

Dev server:

```powershell
Invoke-WebRequest http://localhost:3000/thanh-toan
```

Kết quả:

- HTTP status: `200`
- HTML có `Đặt Hàng`
- HTML có `Thông Tin Giao Hàng`

## Kết luận

Bước 5.4 đã hoàn thành. Trang checkout đã có form giao hàng, thanh toán COD, tóm tắt đơn hàng, submit tạo order, redirect xác nhận và API tỉnh/xã phục vụ dropdown.
