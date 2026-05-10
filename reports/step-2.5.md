# Bao cao Buoc 2.5 - Models Tai Khoan & Lien He

## Ket qua
- Da tao models cho app `accounts` trong `backend/apps/accounts/models.py`.
- Da tao models cho app `contact` trong `backend/apps/contact/models.py`.
- Da dang ky admin cho cac model trong `backend/apps/accounts/admin.py` va `backend/apps/contact/admin.py`.
- Da tao migrations:
  - `backend/apps/accounts/migrations/0001_initial.py`
  - `backend/apps/contact/migrations/0001_initial.py`
- Da chay migrate va apply thanh cong migrations `accounts.0001_initial` va `contact.0001_initial`.

## Models app accounts

### UserProfile
- `user` OneToOne den `AUTH_USER_MODEL`
- `phone`
- `avatar`
- `firebase_uid`
- `created_at`

### Address
- `user` ForeignKey den `AUTH_USER_MODEL`
- `label`
- `receiver_name`
- `phone`
- `address_line`
- `province`
- `district`
- `ward`
- `is_default`

## Models app contact

### ContactSubmission
- `name`
- `phone`
- `email`
- `message`
- `created_at`
- `is_read`

### SiteConfig
- `hotline`
- `zalo_url`
- `facebook_url`
- `address`
- `email`
- `google_map_embed`
- `policy_buying`
- `policy_shipping`

## Admin
- `UserProfileAdmin`: list display, search, readonly `created_at`.
- `AddressAdmin`: list display, filters, search.
- `ContactSubmissionAdmin`: list display, filters, search, readonly `created_at`.
- `SiteConfigAdmin`: chi cho tao mot ban ghi singleton qua `has_add_permission`.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations accounts contact
```

Output:

```text
Migrations for 'accounts':
  backend\apps\accounts\migrations\0001_initial.py
    + Create model Address
    + Create model UserProfile
Migrations for 'contact':
  backend\apps\contact\migrations\0001_initial.py
    + Create model ContactSubmission
    + Create model SiteConfig
```

## Ket qua migrate
Lenh:

```bash
python backend/manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: accounts, admin, auth, contact, contenttypes, documents, news, orders, products, sessions
Running migrations:
  Applying accounts.0001_initial... OK
  Applying contact.0001_initial... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations accounts contact
python backend/manage.py makemigrations --check --dry-run
```

Output:

```text
System check identified no issues (0 silenced).

accounts
 [X] 0001_initial
contact
 [X] 0001_initial

No changes detected
```
