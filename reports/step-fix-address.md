# Bao cao Fix Address - Don vi hanh chinh Viet Nam 2 cap

## Yeu cau
Cap nhat model dia chi theo cau truc hanh chinh Viet Nam moi:
- Chi con 2 cap: Tinh/TP va Xa/Phuong.
- Bo cap Quan/Huyen.
- Bo `district` khoi `Address`.
- Doi `ward` thanh `commune`.
- Them danh muc `Province` va `Commune`.
- Import du lieu tu `Danh mục hành chính.docx`.
- Doi `Address.province` va `Address.commune` sang ForeignKey.

## Files da thay doi
- `backend/apps/accounts/models.py`
- `backend/apps/accounts/admin.py`
- `backend/apps/accounts/migrations/0002_administrative_units_stage1.py`
- `backend/apps/accounts/migrations/0003_address_fk_administrative_units.py`
- `backend/core/settings.py`
- `backend/core/management/__init__.py`
- `backend/core/management/commands/__init__.py`
- `backend/core/management/commands/import_donvi.py`
- `PROGRESS.md`

## Migration 0002
File:

```text
backend/apps/accounts/migrations/0002_administrative_units_stage1.py
```

Noi dung chinh:
- Tao model `Province`.
- Rename `Address.ward` thanh `Address.commune` de giu du lieu cu.
- Xoa field `Address.district`.
- Tao model `Commune`.

Lenh da chay:

```bash
python backend/manage.py migrate accounts
```

Ket qua:

```text
Applying accounts.0002_administrative_units_stage1... OK
```

## Management command import_donvi
File:

```text
backend/core/management/commands/import_donvi.py
```

Command doc truc tiep file DOCX bang XML trong `word/document.xml`, khong can them dependency moi.

Da them `core` vao `INSTALLED_APPS` de Django discover command trong `backend/core/management/commands`.

Lenh da chay:

```bash
python backend/manage.py import_donvi --file ".\Danh mục hành chính.docx"
```

Ket qua:

```text
Import completed: provinces created=34, updated=0; communes created=3321, updated=0; totals provinces=34, communes=3321
```

## Migration 0003
File:

```text
backend/apps/accounts/migrations/0003_address_fk_administrative_units.py
```

Noi dung chinh:
- Them field tam `province_ref` va `commune_ref`.
- Data migration map du lieu text cu tu `Address.province` / `Address.commune` sang FK neu co ban ghi cu.
- Xoa field text cu `province` va `commune`.
- Rename `province_ref` -> `province`.
- Rename `commune_ref` -> `commune`.
- Dat `province` va `commune` la ForeignKey nullable.

Lenh da chay:

```bash
python backend/manage.py makemigrations accounts
python backend/manage.py migrate
python backend/manage.py check
```

Ket qua:

```text
No changes detected in app 'accounts'
Applying accounts.0003_address_fk_administrative_units... OK
System check identified no issues (0 silenced).
```

## Trang thai du lieu
- So tinh/thanh da import: `34`
- So xa/phuong/dac khu da import: `3321`
- So Address hien co: `0`

## Kiem tra schema Address
Bang `accounts_address` hien co cac cot dia chi hanh chinh:

```text
province_id bigint
commune_id bigint
```

Khong con:

```text
district
province text/char
ward text/char
commune text/char
```

## Kiem tra migration
Lenh:

```bash
python backend/manage.py showmigrations accounts
python backend/manage.py makemigrations --check --dry-run
```

Ket qua:

```text
accounts
 [X] 0001_initial
 [X] 0002_administrative_units_stage1
 [X] 0003_address_fk_administrative_units

No changes detected
```
