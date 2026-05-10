# Báo cáo bước 7.1 - Test luồng mua hàng end-to-end

## Mục tiêu

Tạo management command tự động kiểm tra luồng mua hàng end-to-end bằng DRF `APIClient`, kết hợp kiểm tra dữ liệu thực tế trong database.

## Nội dung đã thực hiện

- Tạo file `backend/core/management/commands/test_e2e.py`.
- Command tự tạo test user và staff user.
- Dùng `force_authenticate` cho user thường và staff user.
- Tự thêm `testserver` vào `ALLOWED_HOSTS` trong runtime để DRF `APIClient` chạy ổn định.
- In kết quả từng bước theo dạng `PASS/FAIL`.
- Tổng kết số test passed/failed.

## Trạng thái server

- Backend Django đang listen port `8000`.
- Frontend Next.js đang listen port `3000`.

## Kết quả chạy test

Lệnh đã chạy:

```powershell
venv\Scripts\python.exe backend\manage.py test_e2e
```

Kết quả:

| # | Test case | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | Tạo test user và `force_authenticate` | PASS | `e2e-user@example.com`, `e2e-staff@example.com` |
| 2 | Trang chủ - `GET /api/products/?ordering=-sale_count&page_size=8` | PASS | `results=16` |
| 3 | Danh sách sản phẩm - `GET /api/products/` | PASS | `count=16` |
| 4 | Chi tiết sản phẩm - `GET /api/products/<slug>/` | PASS | `slug=may-phun-thuoc-ien-16l` |
| 5 | Tin tức - `GET /api/news/` | PASS | `count=6` |
| 6 | Tài liệu - `GET /api/documents/` | PASS | `count=10` |
| 7 | Tạo đơn hàng COD 2 items - `POST /api/orders/` | PASS | `order=DM20260003`, `total=2950000` |
| 8 | Danh sách đơn - `GET /api/orders/` | PASS | `count=1` |
| 9 | Chi tiết đơn - `GET /api/orders/<order_number>/` | PASS | `order=DM20260003` |
| 10 | Hủy đơn - `POST /api/orders/<order_number>/cancel/` | PASS | `status=cancelled` |
| 11 | Tạo đơn mới để test admin | PASS | `order=DM20260004` |
| 12 | Xem profile - `GET /api/account/profile/` | PASS | `email=e2e-user@example.com` |
| 13 | Cập nhật profile - `PUT /api/account/profile/` | PASS | `name=E2E Updated User` |
| 14 | Tạo địa chỉ - `POST /api/account/addresses/` | PASS | `address_id=2` |
| 15 | Gửi form liên hệ - `POST /api/contact/` | PASS | `contact_id=2` |
| 16 | Admin stats - `GET /api/admin/stats/` | PASS | `orders=4`, `revenue=0` |
| 17 | Admin đổi trạng thái đơn - `PATCH /api/admin/orders/<order_number>/status/` | PASS | `order=DM20260004`, `status=confirmed` |
| 18 | Admin xuất Excel - `GET /api/admin/orders/export/` | PASS | `Content-Type=xlsx`, `bytes=5284` |

Tổng kết:

- Passed: `18`
- Failed: `0`

## Kiểm tra bổ sung

- `python backend/manage.py check`: thành công, không có lỗi hệ thống.

## Kết quả

Bước 7.1 đã hoàn thành. Luồng mua hàng từ xem sản phẩm, tạo đơn, hủy đơn, profile, địa chỉ, contact form đến admin stats/status/export đều pass.
