# Bao cao Buoc 2.1 - Models San Pham

## Ket qua
- Da tao models cho app `products` trong `backend/apps/products/models.py`.
- Da dang ky admin cho cac model trong `backend/apps/products/admin.py`.
- Da tao migration `backend/apps/products/migrations/0001_initial.py`.
- Da chay migrate va apply thanh cong migration `products.0001_initial`.

## Models da tao

### Category
- `name`
- `slug`
- `color`
- `icon`
- `created_at`

### Plant
- `name`
- `slug`

### Product
- `name`
- `slug`
- `category` ForeignKey den `Category`
- `plants` ManyToMany den `Plant`
- `tag` choices: `Bán chạy`, `Mới`, `Khuyến mãi`, rong
- `price`
- `sale_price`
- `specs` JSONField
- `description`
- `usage`
- `guide`
- `thumbnail`
- `sale_count`
- `is_active`
- `sort_order`
- `created_at`
- `updated_at`

### ProductImage
- `product` ForeignKey den `Product`
- `image`
- `order`

## Admin
- `CategoryAdmin`: list display, search, prepopulated slug.
- `PlantAdmin`: list display, search, prepopulated slug.
- `ProductAdmin`: list display, filters, search, prepopulated slug, `filter_horizontal` cho plants, inline anh san pham.
- `ProductImageInline`: quan ly anh san pham trong trang admin Product.

## Tham chieu prototype
- `CATS`: dung lam co so cho `Category` voi `name`, `color`, va slug se duoc tao khi seed/admin.
- `PLANTS`: dung lam co so cho `Plant`.
- `PRODUCTS`: dung lam co so cho `Product`, gom category, tag, gia goc/gia khuyen mai, cay trong lien quan va mo ta.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations products
```

Output:

```text
Migrations for 'products':
  backend\apps\products\migrations\0001_initial.py
    + Create model Category
    + Create model Plant
    + Create model Product
    + Create model ProductImage
```

## Ket qua migrate
Lenh:

```bash
python backend/manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, products, sessions
Running migrations:
  Applying products.0001_initial... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations products
```

Output:

```text
System check identified no issues (0 silenced).

products
 [X] 0001_initial
```
