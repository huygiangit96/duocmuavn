# Bao cao Buoc 2.3 - Models Tin Tuc

## Ket qua
- Da tao models cho app `news` trong `backend/apps/news/models.py`.
- Da dang ky admin cho `NewsCategory`, `Hashtag`, va `Article` trong `backend/apps/news/admin.py`.
- Da tao migration `backend/apps/news/migrations/0001_initial.py`.
- Da chay migrate va apply thanh cong migration `news.0001_initial`.

## Tham chieu prototype
Da tham khao `prototype_new/dm-data.js` phan `NEWS`.

Prototype co cau truc:
- `catName`: chuyen thanh `NewsCategory`.
- `title`: chuyen thanh `Article.title`.
- `date`: se duoc map thanh `published_at` khi seed data.
- `excerpt`: chuyen thanh `Article.summary`.
- `featured`: co the dung sau nay cho logic hien thi noi bat, chua nam trong model cua plan.
- `tags`: chuyen thanh ManyToMany `Article.hashtags`.

## Models da tao

### NewsCategory
- `name`
- `slug`

### Hashtag
- `name`

### Article
- `title`
- `slug`
- `category` ForeignKey den `NewsCategory`
- `hashtags` ManyToMany den `Hashtag`
- `thumbnail`
- `summary`
- `content`
- `author` ForeignKey den `AUTH_USER_MODEL`
- `is_published`
- `published_at`
- `view_count`
- `created_at`
- `updated_at`

## Admin
- `NewsCategoryAdmin`: list display, search, prepopulated slug.
- `HashtagAdmin`: list display, search.
- `ArticleAdmin`: list display, filters, search, prepopulated slug, `filter_horizontal` cho hashtags, readonly timestamps/view count.

## Ket qua makemigrations
Lenh:

```bash
python backend/manage.py makemigrations news
```

Output:

```text
Migrations for 'news':
  backend\apps\news\migrations\0001_initial.py
    + Create model Hashtag
    + Create model NewsCategory
    + Create model Article
```

## Ket qua migrate
Lenh:

```bash
python backend/manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, news, orders, products, sessions
Running migrations:
  Applying news.0001_initial... OK
```

## Kiem tra
Lenh:

```bash
python backend/manage.py check
python backend/manage.py showmigrations news
python backend/manage.py makemigrations --check --dry-run
```

Output:

```text
System check identified no issues (0 silenced).

news
 [X] 0001_initial

No changes detected
```
