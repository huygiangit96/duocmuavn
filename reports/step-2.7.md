# Bao cao Buoc 2.7 - Models Con Thieu

## Ket qua
- Da them `ProductReview` vao `backend/apps/products/models.py`.
- Da them `Promotion` vao `backend/apps/orders/models.py`.
- Da them `Banner` vao `backend/apps/contact/models.py`.
- Da dang ky tat ca models moi vao admin tuong ung.
- Da tao va apply migrations thanh cong.

## Models da tao

### ProductReview
File:

```text
backend/apps/products/models.py
```

Fields:
- `product` ForeignKey den `Product`
- `user` ForeignKey den `AUTH_USER_MODEL`
- `rating` tu 1 den 5
- `text`
- `status` choices: `pending`, `approved`, `rejected`
- `created_at`

Admin:
- `ProductReviewAdmin` trong `backend/apps/products/admin.py`
- Co list display, filters, search, readonly `created_at`.

### Promotion
File:

```text
backend/apps/orders/models.py
```

Fields:
- `code`
- `name`
- `discount_type` choices: `percent`, `fixed`
- `discount_value`
- `min_order_value`
- `start_date`
- `end_date`
- `usage_limit`
- `used_count`
- `is_active`

Admin:
- `PromotionAdmin` trong `backend/apps/orders/admin.py`
- Co list display, filters, search.

### Banner
File:

```text
backend/apps/contact/models.py
```

Fields:
- `title`
- `subtitle`
- `image`
- `link`
- `order`
- `is_active`
- `tag`
- `bg_color`

Admin:
- `BannerAdmin` trong `backend/apps/contact/admin.py`
- Co list display, filters, search.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations products orders contact
```

Output:

```text
Migrations for 'contact':
  backend\apps\contact\migrations\0002_banner.py
    + Create model Banner
Migrations for 'orders':
  backend\apps\orders\migrations\0002_promotion.py
    + Create model Promotion
Migrations for 'products':
  backend\apps\products\migrations\0002_productreview.py
    + Create model ProductReview
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
  Applying contact.0002_banner... OK
  Applying orders.0002_promotion... OK
  Applying products.0002_productreview... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations products orders contact
python backend/manage.py makemigrations --check --dry-run
```

Output:

```text
System check identified no issues (0 silenced).

products
 [X] 0001_initial
 [X] 0002_productreview
orders
 [X] 0001_initial
 [X] 0002_promotion
contact
 [X] 0001_initial
 [X] 0002_banner

No changes detected
```
