"""
python manage.py import_documents
Import tài liệu từ scripts/data/documents.json vào database.
File PDF được copy sang media/documents/ với tên gốc.
"""

import json
import re
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.documents.models import DocCategory, Document

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
JSON_FILE = BASE_DIR / "scripts" / "data" / "documents.json"
SRC_DIR = BASE_DIR / "scripts" / "data"
MEDIA_DOCS = BASE_DIR / "backend" / "media" / "documents"

CATEGORY_MAP = {
    "paper": ("tai-lieu-ky-thuat", "Tài liệu Kỹ Thuật", "Technical Documents"),
    "video": ("video-ky-thuat", "Video Kỹ Thuật", "Technical Videos"),
}


def parse_date(date_str: str):
    """Parse 'DD/MM/YYYY HH:MM:SS' hoặc 'M/D/YYYY H:MM:SS AM/PM'."""
    if not date_str:
        return None
    for fmt in ("%d/%m/%Y %H:%M:%S", "%m/%d/%Y %I:%M:%S %p", "%d/%m/%Y"):
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return timezone.make_aware(dt)
        except ValueError:
            continue
    return None


def copy_file(src_relative: str, dest_dir: Path) -> str | None:
    src = SRC_DIR / src_relative
    if not src.exists():
        return None
    ext = src.suffix.lower()
    stem = src.stem
    new_name = f"{stem}_{uuid.uuid4().hex[:8]}{ext}"
    dest = dest_dir / new_name
    shutil.copy2(src, dest)
    return f"documents/{new_name}"


def get_or_create_category(doc_type: str) -> DocCategory:
    slug, name_vi, name_en = CATEGORY_MAP.get(doc_type, CATEGORY_MAP["paper"])
    cat, _ = DocCategory.objects.get_or_create(
        slug=slug,
        defaults={"name": name_vi, "name_en": name_en},
    )
    return cat


def make_summary(title: str, doc_type: str) -> str:
    if doc_type == "video":
        return f"Video kỹ thuật: {title[:250]}"
    return f"Tài liệu kỹ thuật: {title[:250]}"


class Command(BaseCommand):
    help = "Import tai lieu tu scripts/data/documents.json vao database"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--skip-existing", action="store_true", default=True)

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        skip_existing = options["skip_existing"]

        if not JSON_FILE.exists():
            self.stderr.write(f"File not found: {JSON_FILE}")
            return

        MEDIA_DOCS.mkdir(parents=True, exist_ok=True)

        data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
        self.stdout.write(f"Loaded {len(data)} documents from JSON")

        created = skipped = 0

        for item in data:
            title = item.get("title", "").strip()
            if not title:
                continue

            slug = re.sub(r"[^a-z0-9\-]", "-", item.get("slug", "")).strip("-")[:240]
            if not slug:
                continue

            if skip_existing and Document.objects.filter(slug=slug).exists():
                self.stdout.write(f"  [SKIP] {slug}")
                skipped += 1
                continue

            doc_type = item.get("doc_type", "paper")
            category = get_or_create_category(doc_type)
            published_at = parse_date(item.get("date", ""))
            summary = make_summary(title, doc_type)

            if dry_run:
                self.stdout.write(f"  [DRY] {slug} | {doc_type}")
                created += 1
                continue

            # Copy PDF file
            file_path = ""
            file_src = item.get("file", "")
            if file_src:
                copied = copy_file(file_src, MEDIA_DOCS)
                if copied:
                    file_path = copied

            doc, was_created = Document.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "title_en": title,
                    "doc_type": doc_type,
                    "category": category,
                    "summary": summary,
                    "summary_en": summary,
                    "content": "",
                    "content_en": "",
                    "file": file_path,
                    "video_url": item.get("video_url") or None,
                    "is_published": True,
                },
            )

            # Set created_at manually via update to preserve original date
            if was_created and published_at:
                Document.objects.filter(pk=doc.pk).update(created_at=published_at)

            status = "CREATED" if was_created else "UPDATED"
            self.stdout.write(f"  [{status}] {slug}")
            created += 1

        self.stdout.write(f"\nDone: {created} processed, {skipped} skipped")
