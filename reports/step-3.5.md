# Bao cao Buoc 3.5 - API Documentation Swagger

## Ket qua
- Da cau hinh Swagger UI bang `drf-spectacular`.
- Da them endpoint OpenAPI schema:

```text
GET /api/schema/
```

- Da them Swagger UI:

```text
GET /api/docs/
```

- Da them Redoc UI:

```text
GET /api/redoc/
```

- Da them OpenAPI auth scheme cho Firebase bearer token.

## Files da tao / cap nhat
- `backend/core/urls.py`
- `backend/core/apps.py`
- `backend/core/schema.py`
- `backend/core/settings.py`
- `backend/apps/accounts/views.py`
- `backend/apps/orders/views.py`
- `backend/apps/contact/views.py`
- `reports/step-3.5-openapi.yaml`
- `PROGRESS.md`

## Cau hinh chinh
- `drf_spectacular` da co trong `INSTALLED_APPS`.
- `REST_FRAMEWORK.DEFAULT_SCHEMA_CLASS` da cau hinh:

```text
drf_spectacular.openapi.AutoSchema
```

- `SPECTACULAR_SETTINGS` da co title, description, version.
- `FirebaseAuthenticationScheme` duoc them trong `backend/core/schema.py` de Swagger hien thi bearer token auth.

## Kiem tra schema generation
Lenh:

```bash
python backend/manage.py spectacular --file reports/step-3.5-openapi.yaml --validate
```

Ket qua:

```text
Thanh cong, khong con warnings/errors.
```

## Kiem tra server
Da chay server tam:

```bash
python backend/manage.py runserver 127.0.0.1:8000 --noreload
```

Ket qua truy cap:

```text
GET http://localhost:8000/api/docs/   -> 200
GET http://localhost:8000/api/schema/ -> 200
GET http://localhost:8000/api/redoc/  -> 200
```

Swagger UI response co chua `SwaggerUIBundle`, xac nhan trang docs da load.

## Danh sach endpoints trong OpenAPI schema
Schema hien co `17` paths:

```text
/api/account/addresses/ [GET,POST]
/api/account/addresses/{id}/ [GET,PUT,PATCH,DELETE]
/api/account/profile/ [GET,PUT,PATCH]
/api/categories/ [GET]
/api/config/ [GET]
/api/contact/ [POST]
/api/documents/ [GET]
/api/documents/{slug}/ [GET]
/api/news/ [GET]
/api/news/{slug}/ [GET]
/api/orders/ [GET,POST]
/api/orders/{order_number}/ [GET]
/api/orders/{order_number}/cancel/ [POST]
/api/plants/ [GET]
/api/products/ [GET]
/api/products/{slug}/ [GET]
/api/schema/ [GET]
```

## Xac nhan day du
- Products API endpoints hien thi.
- Orders API endpoints hien thi.
- News API endpoints hien thi.
- Documents API endpoints hien thi.
- Accounts API endpoints hien thi.
- Contact/config API endpoints hien thi.
- `FirebaseAuth` security scheme co trong OpenAPI components.

## Kiem tra he thong
Lenh:

```bash
python backend/manage.py check
```

Ket qua:

```text
System check identified no issues (0 silenced).
```

## Ghi chu
- Dev server tam da duoc dung sau khi test.
