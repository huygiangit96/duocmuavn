# Bao cao Buoc 3.3 - API Tin Tuc & Tai Lieu

## Ket qua
- Da tao API read-only cho tin tuc.
- Da tao API read-only cho tai lieu.
- Endpoint chi tiet tin tuc tu dong tang `view_count`.
- Da dang ky routes vao `backend/core/urls.py` voi prefix `/api/`.

## Files da tao / cap nhat
- `backend/apps/news/serializers.py`
- `backend/apps/news/filters.py`
- `backend/apps/news/views.py`
- `backend/apps/news/urls.py`
- `backend/apps/documents/serializers.py`
- `backend/apps/documents/filters.py`
- `backend/apps/documents/views.py`
- `backend/apps/documents/urls.py`
- `backend/core/urls.py`
- `PROGRESS.md`

## Endpoints tin tuc
- `GET /api/news/`
- `GET /api/news/{slug}/`
- `GET /api/news/?category=ky-thuat`
- `GET /api/news/?hashtag=lua`
- `GET /api/news/?search=lua`

## Endpoints tai lieu
- `GET /api/documents/`
- `GET /api/documents/{slug}/`
- `GET /api/documents/?doc_type=paper`
- `GET /api/documents/?doc_type=video`
- `GET /api/documents/?category=ky-thuat`
- `GET /api/documents/?plants=lua`
- `GET /api/documents/?search=anvil`

## View count tin tuc
`ArticleDetailView.get_object()` tang view bang atomic update:

```python
Article.objects.filter(pk=obj.pk).update(view_count=F("view_count") + 1)
```

Sau do refresh `view_count` de response tra ve gia tri moi.

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

## Kiem tra URL resolve
Ket qua:

```text
/api/news/ article-list
/api/news/test-slug/ article-detail
/api/documents/ document-list
/api/documents/test-slug/ document-detail
```

## Test API bang DRF APIClient
Ket qua:

```text
news_list_status=200
news_count=6
news_detail_status=200
news_detail_slug=bi-quyet-tang-nang-suat-lua-vu-he-thu-2026
view_count_before=0
view_count_after=1
news_category_status=200
news_category_count=2
news_search_status=200
news_search_count=3
documents_list_status=200
documents_count=10
documents_paper_status=200
documents_paper_count=5
documents_video_status=200
documents_video_count=5
document_detail_status=200
document_detail_slug=paper-huong-dan-su-dung-anvil-5sc
documents_plant_status=200
documents_plant_count=7
```

## Xac nhan dat yeu cau
- News list hoat dong.
- News detail hoat dong va tang `view_count`.
- News filter theo category/search hoat dong.
- Documents list/detail hoat dong.
- Documents filter theo `doc_type` va plants hoat dong.
