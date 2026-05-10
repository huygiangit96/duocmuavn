# Bao cao Buoc 2.6 - Seed Du Lieu Mau

## Ket qua
- Da tao management command `seed_data`.
- File da tao:

```text
backend/core/management/commands/seed_data.py
```

- Command seed du lieu mau tu prototype `prototype_new/dm-data.js` cho:
  - `CATS`
  - `PLANTS`
  - `PRODUCTS`
  - `NEWS`
  - `DOCS_PAPER`
  - `DOCS_VIDEO`
- Command duoc viet theo huong idempotent bang `update_or_create`, chay lai khong nhan doi du lieu.

## Mapping du lieu

### Products
- `CATS` -> `products.Category`
- `PLANTS` -> `products.Plant`
- `PRODUCTS` -> `products.Product`
- Mock `listPrice` -> `Product.price`
- Mock `price` -> `Product.sale_price` neu nho hon `listPrice`
- Mock `unit`, `promo`, `rating`, `reviews` -> `Product.specs`
- Mock `reviews` -> `Product.sale_count`

### News
- `NEWS.catName` -> `news.NewsCategory`
- `NEWS.tags` -> `news.Hashtag`
- `NEWS` -> `news.Article`
- Tao user tac gia `seed-author` neu chua co.

### Documents
- `DOCS_PAPER` -> `documents.Document` voi `doc_type='paper'`
- `DOCS_VIDEO` -> `documents.Document` voi `doc_type='video'`
- `topic` -> `documents.DocCategory`
- `plant` -> ManyToMany den `products.Plant`

## Lenh da chay

```bash
python backend/manage.py seed_data
```

Output:

```text
Seed completed: categories=6, plants=7, products=16 (touched=16), articles=6 (touched=6), documents_paper=5 (touched=5), documents_video=5 (touched=5)
```

## So luong ban ghi sau khi seed
Kiem tra truc tiep bang ORM:

```text
categories=6
plants=7
products=16
news_categories=4
hashtags=19
articles=6
doc_categories=3
documents_paper=5
documents_video=5
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
```

Output:

```text
System check identified no issues (0 silenced).
No changes detected
```

## Dat yeu cau
- Tat ca Category: `6/6`
- Tat ca Plant: `7/7`
- Product: `16` (yeu cau toi thieu 10)
- Article: `6` (yeu cau toi thieu 5)
- Document paper: `5` (yeu cau toi thieu 3)
- Document video: `5` (yeu cau toi thieu 3)
