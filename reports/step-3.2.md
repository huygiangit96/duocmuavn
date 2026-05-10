# Bao cao Buoc 3.2 - API Don Hang

## Ket qua
- Da tao serializers cho app `orders`.
- Da tao views DRF cho list/create/detail/cancel don hang.
- Da tao urls rieng cho app `orders`.
- Da dang ky routes vao `backend/core/urls.py` voi prefix `/api/`.
- Tat ca endpoints orders deu dung `permission_classes = (IsAuthenticated,)`.

## Files da tao / cap nhat
- `backend/apps/orders/serializers.py`
- `backend/apps/orders/views.py`
- `backend/apps/orders/urls.py`
- `backend/core/urls.py`
- `PROGRESS.md`

## Endpoints
- `GET /api/orders/` - danh sach don hang cua user hien tai.
- `POST /api/orders/` - tao don hang moi.
- `GET /api/orders/{order_number}/` - chi tiet don hang cua user hien tai.
- `POST /api/orders/{order_number}/cancel/` - huy don hang neu dang `pending`.

## Serializers

### OrderItemSerializer
- Tra ve item trong don hang, gom product snapshot va subtotal.

### OrderCreateSerializer
- Nhan `payment_method`, thong tin nguoi nhan, note va danh sach `items`.
- Validate don hang phai co it nhat 1 item.
- Validate quantity >= 1.
- Chi cho chon san pham dang `is_active=True`.
- Tinh `subtotal`, `shipping_fee`, `total` tren server.
- Snapshot `product_name` va `product_price` vao `OrderItem`.

### OrderDetailSerializer
- Tra ve thong tin don hang day du kem `items`.

## Logic tinh tien
- Don gia item = `sale_price` neu co, nguoc lai dung `price`.
- `shipping_fee = 0` neu subtotal >= 500000.
- `shipping_fee = 30000` neu subtotal < 500000.
- `total = subtotal + shipping_fee`.

## Kiem tra
Da chay:

```bash
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
```

Ket qua:

```text
System check identified no issues (0 silenced).
No changes detected
```

## Test API don hang mau
Do backend hien cau hinh FirebaseAuthentication, test tao don mau duoc thuc hien bang DRF `APIClient.force_authenticate()` voi user test `api-order-test`.

Ket qua:

```text
unauth_get_status=403
create_status=201
create_order_number=DM20260001
create_items=1
create_total=5000000
list_status=200
list_count=1
detail_status=200
detail_order_number=DM20260001
cancel_status=200
cancel_status_value=cancelled
db_status=cancelled
```

## Xac nhan IsAuthenticated
- Request chua xac thuc den `GET /api/orders/` bi chan voi status `403`.
- Sau khi force-authenticated user test:
  - `POST /api/orders/` tao don thanh cong voi status `201`.
  - `GET /api/orders/` tra danh sach don cua user voi status `200`.
  - `GET /api/orders/{order_number}/` tra chi tiet voi status `200`.
  - `POST /api/orders/{order_number}/cancel/` huy don pending thanh cong voi status `200`.

## Ghi chu
- Don test `DM20260001` da duoc tao trong database va sau do da duoc cancel qua API.
