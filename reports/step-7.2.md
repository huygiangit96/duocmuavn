# Báo cáo bước 7.2 - Kiểm tra Admin CMS

## Mục tiêu

Tạo management command tự động kiểm tra toàn bộ Admin CMS API bằng staff user, đồng thời xác nhận user thường bị chặn quyền truy cập admin.

## Nội dung đã thực hiện

- Tạo file `backend/core/management/commands/test_admin_cms.py`.
- Command tự tạo:
  - Staff user `admin-cms-staff@example.com`.
  - User thường `admin-cms-user@example.com`.
- Dùng DRF `APIClient.force_authenticate`.
- Tự thêm `testserver` vào `ALLOWED_HOSTS` runtime để `APIClient` chạy ổn định.
- Test CRUD và action qua đúng Admin API.
- In kết quả từng bước theo dạng `PASS/FAIL`.

## Kết quả chạy test

Lệnh đã chạy:

```powershell
venv\Scripts\python.exe backend\manage.py test_admin_cms
```

Kết quả:

| # | Test case | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | CRUD Sản phẩm | PASS | `slug=e2e-admin-product` |
| 2 | CRUD Tin tức | PASS | `slug=e2e-admin-article` |
| 3 | CRUD Tài liệu | PASS | `slug=e2e-admin-document` |
| 4 | Quản lý đánh giá | PASS | `review_id=1`, approve và reject đều 200 |
| 5 | Quản lý người dùng | PASS | `users=10`, toggle-active 200 |
| 6 | Khuyến mãi | PASS | `promotion_id=1`, tạo và xóa thành công |
| 7 | Site config | PASS | `site_config_id=1`, PATCH hotline thành công |
| 8 | Banners | PASS | `banners=1` |
| 9 | User thường gọi admin | PASS | Trả về `403` như kỳ vọng |

Tổng kết:

- Passed: `9`
- Failed: `0`

## Ghi chú

- Khi chạy test có log `Forbidden: /api/admin/stats/`; đây là kết quả mong muốn của test user thường bị chặn quyền.
- Có warning pagination cho `SiteConfig` vì queryset chưa có ordering rõ ràng. Warning này không làm test fail và không ảnh hưởng chức năng hiện tại.

## Kiểm tra bổ sung

- `python backend/manage.py check`: thành công, không có lỗi hệ thống.

## Kết quả

Bước 7.2 đã hoàn thành. Giai đoạn 7 - Kiểm Tra Tổng Thể đã hoàn thành 2/2 bước.
