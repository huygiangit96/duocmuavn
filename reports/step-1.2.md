# Báo cáo Bước 1.2 - Cấu hình Settings & Database

## Kết quả
- Đã tạo `backend/.env`.
- Đã thay toàn bộ `backend/core/settings.py` từ cấu hình mặc định sang cấu hình theo plan.
- Đã cấu hình đọc biến môi trường bằng `python-decouple`.
- Đã cấu hình PostgreSQL từ `DATABASE_URL`.
- Đã thêm các app/framework vào `INSTALLED_APPS`:
  - `rest_framework`
  - `corsheaders`
  - `django_filters`
  - `drf_spectacular`
  - `apps.products`
  - `apps.orders`
  - `apps.news`
  - `apps.documents`
  - `apps.accounts`
  - `apps.contact`
- Đã cấu hình `corsheaders.middleware.CorsMiddleware`.
- Đã cấu hình `MEDIA_URL`, `MEDIA_ROOT`.
- Đã cấu hình `REST_FRAMEWORK`:
  - `DEFAULT_AUTHENTICATION_CLASSES`: `core.firebase_auth.FirebaseAuthentication`
  - `DEFAULT_PERMISSION_CLASSES`: `IsAuthenticatedOrReadOnly`
  - `DEFAULT_FILTER_BACKENDS`: `django_filters.rest_framework.DjangoFilterBackend`
  - `DEFAULT_PAGINATION_CLASS`: `PageNumberPagination`
  - `PAGE_SIZE`: `20`
- Đã chỉnh `apps.py` của 6 app local để Django import đúng theo package `apps.*`.

## Nội dung .env
```text
DEBUG=True
SECRET_KEY=duocmua-secret-key-change-in-production
DATABASE_URL=postgres://postgres:123456@localhost:5432/duocmua
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
MEDIA_ROOT=media/
FIREBASE_CREDENTIALS_PATH=core/firebase-credentials.json
```

## Kết nối PostgreSQL
- PostgreSQL service: đang chạy (`postgresql-x64-18`).
- Database `duocmua`: đã tồn tại.
- Kết nối Django xác nhận:
  - Current database: `duocmua`
  - Current user: `postgres`

## Kết quả migrate
Lệnh đã chạy:
```bash
python backend/manage.py migrate
```

Output:
```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  No migrations to apply.
```

## Kiểm tra
Lệnh đã chạy:
```bash
python backend/manage.py check
```

Output:
```text
System check identified no issues (0 silenced).
```

## Ghi chú
- Database `duocmua` đã có sẵn migration mặc định của Django trước khi chạy bước này, nên `migrate` trả về `No migrations to apply`.
- Bảng `django_migrations` hiện có 20 migration. Ngoài các migration mặc định của Django, database cũng đang có lịch sử migration app `commerce` từ trước. Bước này không xóa hoặc sửa dữ liệu/migration cũ trong database.
- File `core/firebase_auth.py` và Firebase credentials sẽ được tạo ở Bước 1.3 theo plan.
