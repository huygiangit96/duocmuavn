# Báo cáo Bước 1.1 - Tạo cấu trúc thư mục Django

## Kết quả
- Đã tạo virtual environment tại `venv/`.
- Đã tạo Django project tại `backend/` với project `core`.
- Đã tạo thư mục `backend/apps/`.
- Đã tạo 6 app Django:
  - `products`
  - `orders`
  - `news`
  - `documents`
  - `accounts`
  - `contact`
- Đã tạo `backend/requirements.txt`.

## Phiên bản
- Python: `3.13.5`
- Django: `6.0.4`

## Cấu trúc chính đã tạo
```text
backend/
  core/
    __init__.py
    asgi.py
    settings.py
    urls.py
    wsgi.py
  apps/
    __init__.py
    products/
    orders/
    news/
    documents/
    accounts/
    contact/
  manage.py
  requirements.txt
```

## Packages trong requirements.txt
```text
anyio==4.13.0
asgiref==3.11.1
attrs==26.1.0
CacheControl==0.14.4
certifi==2026.4.22
cffi==2.0.0
charset-normalizer==3.4.7
cryptography==48.0.0
Django==6.0.4
django-cors-headers==4.9.0
django-filter==25.2
djangorestframework==3.17.1
djangorestframework_simplejwt==5.5.1
drf-spectacular==0.29.0
firebase_admin==7.4.0
google-api-core==2.30.3
google-auth==2.50.0
google-cloud-core==2.5.1
google-cloud-firestore==2.27.0
google-cloud-storage==3.10.1
google-crc32c==1.8.0
google-resumable-media==2.8.2
googleapis-common-protos==1.74.0
grpcio==1.80.0
grpcio-status==1.80.0
h11==0.16.0
h2==4.3.0
hpack==4.1.0
httpcore==1.0.9
httpx==0.28.1
hyperframe==6.1.0
idna==3.13
inflection==0.5.1
jsonschema==4.26.0
jsonschema-specifications==2025.9.1
msgpack==1.1.2
pillow==12.2.0
proto-plus==1.27.2
protobuf==6.33.6
psycopg2-binary==2.9.12
pyasn1==0.6.3
pyasn1_modules==0.4.2
pycparser==3.0
PyJWT==2.12.1
python-decouple==3.8
PyYAML==6.0.3
referencing==0.37.0
requests==2.33.1
rpds-py==0.30.0
sqlparse==0.5.5
typing_extensions==4.15.0
tzdata==2026.2
uritemplate==4.2.0
urllib3==2.6.3
```

## Lỗi gặp phải
- Không có lỗi trong quá trình tạo virtualenv, cài package, tạo Django project và tạo apps.

## Ghi chú
- Kế hoạch yêu cầu cấu trúc app nằm dưới `backend/apps/`, vì vậy các app đã được tạo trực tiếp trong thư mục này.
