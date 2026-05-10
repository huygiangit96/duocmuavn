# Báo cáo Bước 3.6 - Admin API

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

- Tạo permission dùng chung tại `backend/core/permissions.py`:
  - `IsStaffUser`: chỉ cho phép request đã đăng nhập và `user.is_staff=True`.
- Xây dựng Admin API với prefix `/api/admin/`:
  - `backend/core/admin_serializers.py`
  - `backend/core/admin_api.py`
  - `backend/core/admin_urls.py`
  - Gắn route vào `backend/core/urls.py`.
- Bổ sung dependency `openpyxl==3.1.5` vào `backend/requirements.txt`.
- Sinh schema kiểm tra tại `reports/step-3.6-openapi.yaml`.

## Endpoints Admin

Tất cả endpoint dưới đây yêu cầu `IsStaffUser`.

- `GET /api/admin/stats/`
- `/api/admin/products/`
- `/api/admin/categories/`
- `/api/admin/plants/`
- `/api/admin/orders/`
- `PATCH /api/admin/orders/{order_number}/status/`
- `GET /api/admin/orders/export/`
- `/api/admin/promotions/`
- `/api/admin/reviews/`
- `PATCH /api/admin/reviews/{id}/approve/`
- `PATCH /api/admin/reviews/{id}/reject/`
- `/api/admin/users/`
- `PATCH /api/admin/users/{id}/toggle-active/`
- `/api/admin/news/`
- `/api/admin/news-categories/`
- `/api/admin/hashtags/`
- `/api/admin/documents/`
- `/api/admin/document-categories/`
- `/api/admin/banners/`
- `/api/admin/contacts/`
- `/api/admin/site-config/`

## Dashboard Stats

`GET /api/admin/stats/` trả về:

- `orders`
- `revenue`
- `customers`
- `products`
- `recent_orders`
- `new_users`
- `orders_by_status`

## Export Excel

`GET /api/admin/orders/export/` xuất file Excel bằng `openpyxl`.

Kết quả response:

- Status: `200`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File name: `orders.xlsx`

## Kiểm thử

Đã chạy:

```powershell
venv\Scripts\python.exe backend/manage.py check
venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
venv\Scripts\python.exe backend/manage.py spectacular --file reports/step-3.6-openapi.yaml --validate
```

Kết quả:

- `check`: không có lỗi.
- `makemigrations --check --dry-run`: không có migration mới.
- `spectacular --validate`: không có error; còn 1 warning enum `status` do nhiều model có choice field cùng tên.

Kiểm thử quyền bằng DRF `APIClient`:

- User thường gọi `GET /api/admin/stats/`: `403`.
- User thường gọi `GET /api/admin/products/`: `403`.
- Staff gọi `GET /api/admin/stats/`: `200`.
- Staff gọi `GET /api/admin/products/`: `200`.
- Staff gọi `GET /api/admin/orders/export/`: `200`, trả file `.xlsx`.
- Staff gọi `PATCH /api/admin/orders/{order_number}/status/`: `200`.

## Kết luận

Bước 3.6 đã hoàn thành. Admin API đã có prefix `/api/admin/`, bảo vệ bằng `IsStaffUser`, có dashboard stats và xuất Excel đơn hàng bằng `openpyxl`.
