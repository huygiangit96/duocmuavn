"""
python manage.py import_news
Import tin tức từ scripts/data/news.json vào database.
Thumbnail + ảnh nội dung được copy vào media/news/
"""

import json
import re
import shutil
import sys
import uuid
from datetime import datetime
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.news.models import Article, NewsCategory

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
JSON_FILE = BASE_DIR / "scripts" / "data" / "news.json"
IMG_SRC_DIR = BASE_DIR / "scripts" / "data"
MEDIA_NEWS = BASE_DIR / "backend" / "media" / "news"

User = get_user_model()

CATEGORY_MAP = {
    "tin tuc cong ty": ("tin-tuc-cong-ty", "Tin tức công ty", "Company News"),
    "tin nganh nong nghiep": ("tin-nganh-nong-nghiep", "Tin ngành nông nghiệp", "Agriculture News"),
}

EN_SUMMARY_PREFIX = {
    "tin-tuc-cong-ty": "Company news: ",
    "tin-nganh-nong-nghiep": "Agriculture news: ",
}


def vi_to_ascii(text: str) -> str:
    replacements = [
        ("àáạảãâầấậẩẫăằắặẳẵ", "a"),
        ("èéẹẻẽêềếệểễ", "e"),
        ("ìíịỉĩ", "i"),
        ("òóọỏõôồốộổỗơờớợởỡ", "o"),
        ("ùúụủũưừứựửữ", "u"),
        ("ỳýỵỷỹ", "y"),
        ("đ", "d"),
    ]
    result = text.lower()
    for chars, replacement in replacements:
        for ch in chars:
            result = result.replace(ch, replacement)
    return result


def normalize_key(text: str) -> str:
    return vi_to_ascii(text.strip().lower())


def parse_date(date_str: str):
    if not date_str:
        return None
    for fmt in ("%m/%d/%Y %I:%M:%S %p", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return timezone.make_aware(dt)
        except ValueError:
            continue
    return None


def copy_image(src_relative: str, slug: str) -> str | None:
    """Copy ảnh từ scripts/data/ sang media/news/, trả về path tương đối."""
    src = IMG_SRC_DIR / src_relative
    if not src.exists():
        return None
    ext = src.suffix.lower()
    new_name = f"{slug}_{uuid.uuid4().hex[:12]}{ext}"
    dest = MEDIA_NEWS / new_name
    shutil.copy2(src, dest)
    return f"news/{new_name}"


def rewrite_content_images(content_html: str, img_url_map: dict, slug: str) -> tuple[str, dict]:
    """
    Thay thế src tuyệt đối trong HTML bằng URL media local.
    Trả về (content_html_mới, {old_local_path -> new_media_path})
    """
    copied: dict[str, str] = {}

    def replace_src(match):
        src = match.group(1)
        # Tìm local path tương ứng trong img_url_map
        local_path = img_url_map.get(src)
        if not local_path:
            return match.group(0)

        if local_path in copied:
            media_path = copied[local_path]
        else:
            media_path = copy_image(local_path, slug)
            if media_path:
                copied[local_path] = media_path
            else:
                return match.group(0)

        return f'src="/media/{media_path}"'

    new_html = re.sub(r'src="([^"]+)"', replace_src, content_html)
    return new_html, copied


def strip_html_to_text(html: str) -> str:
    import html as html_module
    text = re.sub(r"<[^>]+>", " ", html)
    text = html_module.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def get_or_create_category(cat_name: str):
    key = normalize_key(cat_name)
    info = CATEGORY_MAP.get(key)
    if info:
        slug, name_vi, name_en = info
    else:
        slug = "tin-tuc-cong-ty"
        name_vi = cat_name or "Tin tức công ty"
        name_en = "Company News"

    cat, _ = NewsCategory.objects.get_or_create(
        slug=slug,
        defaults={"name": name_vi, "name_en": name_en},
    )
    return cat


class Command(BaseCommand):
    help = "Import tin tuc tu scripts/data/news.json vao database"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Chay thu, khong ghi vao database")
        parser.add_argument("--skip-existing", action="store_true", default=True)

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        skip_existing = options["skip_existing"]

        if not JSON_FILE.exists():
            self.stderr.write(f"File not found: {JSON_FILE}")
            return

        MEDIA_NEWS.mkdir(parents=True, exist_ok=True)

        author = User.objects.filter(is_superuser=True).first() or User.objects.first()
        if not author:
            self.stderr.write("No user found. Create a superuser first.")
            return

        data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
        self.stdout.write(f"Loaded {len(data)} articles from JSON")

        created = skipped = 0

        for item in data:
            title = item.get("title", "").strip()
            if not title:
                continue

            slug = vi_to_ascii(item.get("slug", "").strip())
            slug = re.sub(r"[^a-z0-9\-]", "-", slug).strip("-")
            if not slug:
                continue

            if skip_existing and Article.objects.filter(slug=slug).exists():
                self.stdout.write(f"  [SKIP] {slug}")
                skipped += 1
                continue

            category = get_or_create_category(item.get("category", ""))
            published_at = parse_date(item.get("date", ""))

            if dry_run:
                self.stdout.write(f"  [DRY] {slug} | {category.slug} | {published_at}")
                created += 1
                continue

            # Copy thumbnail
            thumbnail_path = ""
            thumb_src = item.get("thumbnail", "")
            if thumb_src:
                result = copy_image(thumb_src, slug)
                if result:
                    thumbnail_path = result

            # Rewrite HTML content (replace absolute img src with local media paths)
            content_html = item.get("content_html", "")
            img_url_map = item.get("img_url_map", {})
            if content_html and img_url_map:
                content_html, _ = rewrite_content_images(content_html, img_url_map, slug)

            # Plain text summary from HTML
            plain_text = strip_html_to_text(content_html)
            summary = plain_text[:280].rstrip() if plain_text else title[:280]
            cat_slug = category.slug
            prefix = EN_SUMMARY_PREFIX.get(cat_slug, "")
            summary_en = f"{prefix}{summary[:200]}"

            article, was_created = Article.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "title_en": title,
                    "category": category,
                    "thumbnail": thumbnail_path,
                    "summary": summary,
                    "summary_en": summary_en,
                    "content": content_html,
                    "content_en": "[This article is available in Vietnamese only.]",
                    "author": author,
                    "is_published": True,
                    "published_at": published_at or timezone.now(),
                },
            )

            status = "CREATED" if was_created else "UPDATED"
            self.stdout.write(
                f"  [{status}] {slug} | thumb={'yes' if thumbnail_path else 'NO'}".encode("ascii", "replace").decode()
            )
            created += 1

        self.stdout.write(f"\nDone: {created} processed, {skipped} skipped")
