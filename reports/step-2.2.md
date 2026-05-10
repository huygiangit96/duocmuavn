# Bao cao Buoc 2.2 - Models Don Hang

## Ket qua
- Da tao models cho app `orders` trong `backend/apps/orders/models.py`.
- Da dang ky admin cho `Order` va `OrderItem` trong `backend/apps/orders/admin.py`.
- Da tao migration `backend/apps/orders/migrations/0001_initial.py`.
- Da chay migrate va apply thanh cong migration `orders.0001_initial`.

## Models da tao

### Order
- `user` ForeignKey den `AUTH_USER_MODEL`, nullable de ho tro guest.
- `order_number` unique, auto-generate.
- `status` choices: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`.
- `payment_method` choices: `cod`, `vnpay`, `momo`.
- `payment_status` choices: `unpaid`, `paid`, `refunded`.
- `receiver_name`
- `receiver_phone`
- `receiver_address`
- `subtotal`
- `shipping_fee`
- `total`
- `note`
- `vnpay_txn_ref`
- `momo_txn_ref`
- `created_at`
- `updated_at`

### OrderItem
- `order` ForeignKey den `Order`, `related_name='items'`.
- `product` ForeignKey den `products.Product`.
- `product_name`
- `product_price`
- `quantity`
- `subtotal` property = `quantity * product_price`.

## Auto-generate order_number
- Format: `DM` + nam hien tai + so thu tu 4 chu so.
- Vi du test trong ngay 2026-05-05: `DM20260001`.
- Logic nam trong `Order.generate_order_number()` va duoc goi tu `Order.save()` khi `order_number` rong.

## Admin
- `OrderAdmin`: hien thi ma don, nguoi nhan, so dien thoai, trang thai, thanh toan, tong tien va ngay tao.
- `OrderItemInline`: quan ly cac item ngay trong trang admin cua don hang.
- `OrderItemAdmin`: admin rieng cho item, co search theo ma don va ten san pham.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations orders
```

Output:

```text
Migrations for 'orders':
  backend\apps\orders\migrations\0001_initial.py
    + Create model Order
    + Create model OrderItem
```

## Ket qua migrate
Lenh:

```bash
python backend/manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, orders, products, sessions
Running migrations:
  Applying orders.0001_initial... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations orders
```

Output:

```text
System check identified no issues (0 silenced).

orders
 [X] 0001_initial
```

Kiem tra tao don hang thu trong transaction rollback:

```text
DM20260001
rollback_ok
```
