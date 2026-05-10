# Bao cao Buoc 3.1 - API San Pham

## Ket qua
- Da tao serializers cho app `products`.
- Da tao filterset cho san pham.
- Da tao views DRF cho category, plant, product list va product detail.
- Da tao urls rieng cho app `products`.
- Da dang ky routes vao `backend/core/urls.py` voi prefix `/api/`.

## Files da tao / cap nhat
- `backend/apps/products/serializers.py`
- `backend/apps/products/filters.py`
- `backend/apps/products/views.py`
- `backend/apps/products/urls.py`
- `backend/core/urls.py`
- `PROGRESS.md`

## Endpoints
- `GET /api/categories/`
- `GET /api/plants/`
- `GET /api/products/`
- `GET /api/products/?search=thuoc`
- `GET /api/products/?category=thuoc-tru-benh`
- `GET /api/products/?plants=lua`
- `GET /api/products/?tag=Bán chạy`
- `GET /api/products/?ordering=price`
- `GET /api/products/?ordering=-sale_count`
- `GET /api/products/{slug}/`

## Serializers
- `CategorySerializer`: `id`, `name`, `slug`, `color`, `icon`
- `PlantSerializer`: `id`, `name`, `slug`
- `ProductListSerializer`: `id`, `name`, `slug`, `tag`, `price`, `sale_price`, `thumbnail`, `category`
- `ProductDetailSerializer`: full fields, gom `description`, `usage`, `guide`, `images`, `plants`, `specs`

## Filter / search / ordering
- Filter category theo `category` slug.
- Filter cay trong theo `plants` slug, ho tro comma-separated slugs.
- Filter tag theo `tag`.
- Search theo `name`, `slug`, `description`, `usage`, `guide`.
- Ordering theo `price`, `sale_price`, `created_at`, `sale_count`, `sort_order`.

## Kiem tra bang curl
Da chay Django dev server tam:

```bash
python backend/manage.py runserver 127.0.0.1:8000 --noreload
```

### Categories
Lenh:

```bash
curl http://127.0.0.1:8000/api/categories/
```

Ket qua:

```text
HTTP 200
categories_count=6
first=kich-thich-sinh-truong
```

### Plants
Lenh:

```bash
curl http://127.0.0.1:8000/api/plants/
```

Ket qua:

```text
HTTP 200
plants_count=7
first=ca-phe
```

### Product list
Lenh:

```bash
curl http://127.0.0.1:8000/api/products/
```

Ket qua:

```text
HTTP 200
products_status_count=16
page_results=16
first_slug=may-phun-thuoc-ien-16l
```

### Search
Lenh:

```bash
curl "http://127.0.0.1:8000/api/products/?search=thuoc"
```

Ket qua:

```text
HTTP 200
search_count=1
first_slug=may-phun-thuoc-ien-16l
```

### Category filter
Lenh:

```bash
curl "http://127.0.0.1:8000/api/products/?category=thuoc-tru-benh"
```

Ket qua:

```text
HTTP 200
category_count=3
first_category=thuoc-tru-benh
```

### Plant filter
Lenh:

```bash
curl "http://127.0.0.1:8000/api/products/?plants=lua"
```

Ket qua:

```text
HTTP 200
plants_filter_count=9
first_slug=may-phun-thuoc-ien-16l
```

### Tag filter
Lenh:

```bash
curl "http://127.0.0.1:8000/api/products/?tag=B%C3%A1n%20ch%E1%BA%A1y"
```

Ket qua:

```text
HTTP 200
tag_count=6
first_tag=Bán chạy
```

### Ordering
Lenh:

```bash
curl "http://127.0.0.1:8000/api/products/?ordering=-sale_count"
```

Ket qua:

```text
HTTP 200
ordering_count=16
first_slug=regent-800wg
```

### Product detail
Lenh:

```bash
curl http://127.0.0.1:8000/api/products/may-phun-thuoc-ien-16l/
```

Ket qua:

```text
HTTP 200
detail_slug=may-phun-thuoc-ien-16l
detail_plants=2
has_specs=True
```

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

## Ghi chu
- Dev server tam da duoc dung sau khi test.
- Search `thuoc` khong dau duoc ho tro thong qua tim trong `slug`, de phu hop URL/search khong dau.
