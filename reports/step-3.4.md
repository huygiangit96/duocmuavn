# Bao cao Buoc 3.4 - API Tai Khoan & Lien He

## Ket qua
- Da tao API profile va address cho app `accounts`.
- Da tao API contact form va config public cho app `contact`.
- Da dang ky routes vao `backend/core/urls.py` voi prefix `/api/`.
- Address API dung FK `Province` va `Commune` theo mo hinh hanh chinh 2 cap.

## Files da tao / cap nhat
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/views.py`
- `backend/apps/accounts/urls.py`
- `backend/apps/contact/serializers.py`
- `backend/apps/contact/views.py`
- `backend/apps/contact/urls.py`
- `backend/core/urls.py`
- `PROGRESS.md`

## Endpoints accounts
- `GET /api/account/profile/` - xem profile user hien tai, yeu cau auth.
- `PUT /api/account/profile/` - cap nhat profile user hien tai, yeu cau auth.
- `GET /api/account/addresses/` - danh sach dia chi cua user hien tai, yeu cau auth.
- `POST /api/account/addresses/` - tao dia chi moi, yeu cau auth.
- `PUT/PATCH /api/account/addresses/{id}/` - cap nhat dia chi, yeu cau auth.
- `DELETE /api/account/addresses/{id}/` - xoa dia chi, yeu cau auth.

## Endpoints contact
- `POST /api/contact/` - gui form lien he public.
- `GET /api/config/` - lay site config public.

## Address theo don vi hanh chinh moi
`AddressSerializer` dung:
- `province` la FK den `Province`.
- `commune` la FK den `Commune`.
- Response tra them `province_detail` va `commune_detail`.
- Validate `commune` phai thuoc dung `province`.
- Khi tao/cap nhat dia chi `is_default=True`, cac dia chi khac cua user duoc set `is_default=False`.

## Kiem tra he thong
Lenh:

```bash
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
```

Ket qua:

```text
System check identified no issues (0 silenced).
No changes detected
```

## Kiem tra URL resolve
Ket qua:

```text
/api/account/profile/ profile
/api/account/addresses/ address-list
/api/account/addresses/1/ address-detail
/api/contact/ contact-submit
/api/config/ site-config
```

## Test API bang DRF APIClient
Ket qua:

```text
unauth_profile_status=403
unauth_addresses_status=403
profile_get_status=200
profile_email=api-account-test@example.com
profile_put_status=200
profile_name=Nguyen Test
profile_phone=0912345678
address_create_status=201
address_id=1
address_province=Thành phố Hà Nội
address_commune=Phường Ba Đình
address_list_status=200
address_list_count=1
address_patch_status=200
address_patch_label=Kho
address_delete_status=204
contact_status=201
contact_id=1
config_status=200
config_hotline=1800 xxxx
contact_count=1
address_exists_after_delete=False
```

## Xac nhan dat yeu cau
- Profile API yeu cau auth va hoat dong.
- Address API yeu cau auth va hoat dong voi FK `Province`/`Commune`.
- Contact form public hoat dong.
- `/api/config/` public hoat dong.
