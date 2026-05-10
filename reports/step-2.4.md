# Bao cao Buoc 2.4 - Models Tai Lieu

## Ket qua
- Da tao models cho app `documents` trong `backend/apps/documents/models.py`.
- Da dang ky admin cho `DocCategory` va `Document` trong `backend/apps/documents/admin.py`.
- Da tao migration `backend/apps/documents/migrations/0001_initial.py`.
- Da chay migrate va apply thanh cong migration `documents.0001_initial`.

## Tham chieu prototype
Da tham khao `prototype_new/dm-data.js` phan `DOCS_PAPER` va `DOCS_VIDEO`.

Prototype co cau truc:
- `DOCS_PAPER`: `title`, `topic`, `plant`, `date`.
- `DOCS_VIDEO`: `title`, `topic`, `plant`, `duration`.

Mapping sang model:
- `topic` -> `DocCategory`.
- `plant` -> ManyToMany `Document.plants` den `products.Plant`.
- Paper va video dung chung model `Document`.
- `doc_type='paper'` cho tai lieu doc/PDF.
- `doc_type='video'` cho tai lieu video.
- `date` va `duration` co the duoc map vao `summary` hoac `content` khi seed data.

## Models da tao

### DocCategory
- `name`
- `slug`

### Document
- `title`
- `slug`
- `doc_type` choices: `paper`, `video`
- `category` ForeignKey den `DocCategory`
- `plants` ManyToMany den `products.Plant`
- `thumbnail`
- `summary`
- `content`
- `file`
- `video_url`
- `is_published`
- `created_at`
- `updated_at`

## Admin
- `DocCategoryAdmin`: list display, search, prepopulated slug.
- `DocumentAdmin`: list display, filters theo loai/category/plants/status, search, prepopulated slug, `filter_horizontal` cho plants.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations documents
```

Output:

```text
Migrations for 'documents':
  backend\apps\documents\migrations\0001_initial.py
    + Create model DocCategory
    + Create model Document
```

## Ket qua migrate
Lenh:

```bash
python backend/manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, documents, news, orders, products, sessions
Running migrations:
  Applying documents.0001_initial... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations documents
python backend/manage.py makemigrations --check --dry-run
```

Output:

```text
System check identified no issues (0 silenced).

documents
 [X] 0001_initial

No changes detected
```
