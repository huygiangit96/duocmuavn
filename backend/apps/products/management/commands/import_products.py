"""
python manage.py import_products
Import sản phẩm từ scripts/data/products.json vào database.
Ảnh được đổi tên theo quy chuẩn: {slug}_{12hex}.{ext}
"""

import json
import os
import random
import re
import shutil
import uuid
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils.text import slugify as django_slugify

from apps.products.models import Category, Product, ProductImage

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
JSON_FILE = BASE_DIR / "scripts" / "data" / "products.json"
IMG_SRC_DIR = BASE_DIR / "scripts" / "data" / "images"
MEDIA_PRODUCTS = BASE_DIR / "backend" / "media" / "products"

# Mapping category JSON → slug trong DB (case-insensitive key)
CATEGORY_MAP = {
    "thuoc tru benh":      "thuoc-tru-benh",
    "thuoc tru sau":       "thuoc-tru-sau",
    "may va thiet bi nong nghiep": "may-thiet-bi",
    "thuoc tru tuyen trung":       "thuoc-tru-tuyen-trung",
    "thuoc kich thich sinh truong":"kich-thich-sinh-truong",
    "thuoc tru nhuyen the":        "thuoc-tru-nhuyen-the",
}

# Giá tham khảo theo danh mục (VND)
PRICE_RANGES = {
    "may-thiet-bi":          (1_500_000, 8_000_000, 500_000),
    "thuoc-tru-sau":         (85_000,    420_000,   5_000),
    "thuoc-tru-benh":        (90_000,    380_000,   5_000),
    "thuoc-tru-tuyen-trung": (120_000,   450_000,   5_000),
    "kich-thich-sinh-truong":(70_000,    280_000,   5_000),
    "thuoc-tru-nhuyen-the":  (80_000,    250_000,   5_000),
}

# Mô tả tiếng Anh theo danh mục
EN_CAT_DESC = {
    "may-thiet-bi":          "Agricultural equipment designed for efficient spraying and crop management.",
    "thuoc-tru-sau":         "Advanced insecticide for effective pest control across various crops.",
    "thuoc-tru-benh":        "Professional fungicide and bactericide for plant disease management.",
    "thuoc-tru-tuyen-trung": "Specialized nematicide for controlling soil-borne nematode populations.",
    "kich-thich-sinh-truong":"Plant growth regulator to enhance vigor, root development, and stress resistance.",
    "thuoc-tru-nhuyen-the":  "Molluscicide formulated to control snails and slugs in paddy fields.",
}

# Hướng dẫn sử dụng mẫu tiếng Việt theo danh mục
USAGE_VI = {
    "may-thiet-bi": (
        "Sạc pin đầy trước khi sử dụng. Đổ nước thuốc vào bình, đóng nắp chắc chắn. "
        "Điều chỉnh vòi phun phù hợp với loại cây trồng. Phun đều lên bề mặt lá và thân cây. "
        "Vệ sinh bình sau mỗi lần sử dụng."
    ),
    "thuoc-tru-sau": (
        "Pha với nước sạch theo liều lượng khuyến cáo trên bao bì. "
        "Phun đều lên cây vào sáng sớm hoặc chiều mát khi không có gió. "
        "Không phun khi trời sắp mưa. Mặc đồ bảo hộ khi sử dụng. "
        "Cách ly ít nhất 7–14 ngày trước khi thu hoạch."
    ),
    "thuoc-tru-benh": (
        "Pha với nước sạch theo tỷ lệ khuyến cáo. Phun đều và kỹ lên tất cả bộ phận của cây. "
        "Phun phòng định kỳ 7–10 ngày/lần. Khi bệnh đã xuất hiện, phun 2 lần cách nhau 5–7 ngày. "
        "Thời điểm phun tốt nhất: sáng sớm hoặc chiều mát."
    ),
    "thuoc-tru-tuyen-trung": (
        "Xử lý đất trước khi trồng hoặc tưới gốc cây bị nhiễm. "
        "Pha với nước theo liều lượng chỉ định. Tưới đều xung quanh gốc cây, "
        "sau đó tưới thêm nước để thuốc thấm sâu vào đất. "
        "Xử lý lại sau 30 ngày nếu cần thiết."
    ),
    "kich-thich-sinh-truong": (
        "Pha loãng với nước theo hướng dẫn. Phun lên toàn bộ cây hoặc tưới gốc. "
        "Sử dụng vào giai đoạn cây cần kích thích: ra rễ, đâm chồi, ra hoa, đậu quả. "
        "Không sử dụng quá liều để tránh ảnh hưởng xấu đến cây trồng."
    ),
    "thuoc-tru-nhuyen-the": (
        "Rải đều trên ruộng lúa khi có nước. Liều lượng theo khuyến cáo trên bao bì. "
        "Hiệu quả cao nhất khi rải vào buổi chiều tối. "
        "Duy trì mực nước trong ruộng 3–5 cm sau khi xử lý để tăng hiệu lực thuốc."
    ),
}

GUIDE_VI = {
    "may-thiet-bi": (
        "Kiểm tra pin và bình chứa trước khi phun. Chọn đầu phun phù hợp với loại thuốc. "
        "Áp suất phun tối ưu: 2–4 bar. Bảo dưỡng định kỳ sau 50 giờ sử dụng."
    ),
    "thuoc-tru-sau": (
        "Luân phiên nhóm hoạt chất để tránh kháng thuốc. "
        "Kết hợp với chất bám dính khi phun trong điều kiện nắng nóng. "
        "Quan sát kỹ mật độ sâu trước khi quyết định phun lần 2."
    ),
    "thuoc-tru-benh": (
        "Phun phòng trước khi bệnh xuất hiện cho hiệu quả tốt nhất. "
        "Khi nhiễm nặng, kết hợp cắt tỉa bộ phận bị bệnh trước khi phun. "
        "Điều chỉnh pH nước pha về 6–7 để tăng độ bền hoạt chất."
    ),
    "thuoc-tru-tuyen-trung": (
        "Kết hợp biện pháp luân canh cây trồng để giảm mật độ tuyến trùng trong đất. "
        "Cải thiện thoát nước, tránh tưới thừa nước vì tuyến trùng phát triển mạnh trong đất ẩm."
    ),
    "kich-thich-sinh-truong": (
        "Không phối trộn với thuốc có tính kiềm mạnh. "
        "Sử dụng vào giai đoạn sinh trưởng mạnh để đạt hiệu quả tối đa. "
        "Bổ sung vi lượng định kỳ để hỗ trợ cây hấp thu tốt hơn."
    ),
    "thuoc-tru-nhuyen-the": (
        "Kiểm tra sau 2–3 ngày để đánh giá hiệu quả. "
        "Kết hợp vệ sinh bờ ruộng để loại bỏ nơi trú ẩn của ốc. "
        "Thu gom ốc chết tránh ô nhiễm nguồn nước."
    ),
}


def vi_to_ascii(text: str) -> str:
    """Chuyển tiếng Việt có dấu sang không dấu để slugify."""
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


def normalize_category_key(name: str) -> str:
    return vi_to_ascii(name.strip().lower())


def make_price(cat_slug: str) -> tuple[int, int | None]:
    lo, hi, step = PRICE_RANGES.get(cat_slug, (100_000, 400_000, 5_000))
    steps = (hi - lo) // step
    price = lo + random.randint(0, steps) * step
    # ~40% sản phẩm có giá khuyến mãi
    sale = None
    if random.random() < 0.4:
        disc = random.choice([0.05, 0.08, 0.10, 0.12, 0.15])
        sale = int(price * (1 - disc) // step * step)
    return price, sale


def make_name_en(name_vi: str) -> str:
    """Tạo tên tiếng Anh từ tên sản phẩm (giữ mã sản phẩm, dịch hậu tố)."""
    replacements = {
        "THUỐC TRỪ": "", "THUOC TRU": "",
        "BÌNH PHUN": "SPRAYER", "BINH PHUN": "SPRAYER",
        "CHẾ PHẨM": "PRODUCT", "CHE PHAM": "PRODUCT",
        "DÒNG": "LINE", "DONG": "LINE",
    }
    result = name_vi.upper()
    for vi, en in replacements.items():
        result = result.replace(vi, en).strip()
    return result.strip()


def make_desc_en(name_vi: str, cat_slug: str, desc_vi: str) -> str:
    base = EN_CAT_DESC.get(cat_slug, "High-quality agricultural product from Duoc Mua.")
    # Trích hoạt chất từ mô tả tiếng Việt nếu có
    lines = [l.strip() for l in desc_vi.split("\n") if l.strip()]
    ingredients = [l for l in lines if any(c.isdigit() for c in l) and ("g/L" in l or "%" in l or "g/l" in l)]
    if ingredients:
        ing_text = "; ".join(ingredients[:3])
        return f"{base} Active ingredients: {ing_text}."
    return base


def copy_and_rename_image(src_filename: str, product_slug: str, dest_dir: Path) -> str | None:
    """Copy ảnh, đổi tên theo quy chuẩn {slug}_{12hex}.{ext}, trả về relative path cho ImageField."""
    src = IMG_SRC_DIR / src_filename
    if not src.exists():
        return None
    ext = src.suffix.lower()
    new_name = f"{product_slug}_{uuid.uuid4().hex[:12]}{ext}"
    dest = dest_dir / new_name
    shutil.copy2(src, dest)
    return f"products/{new_name}"


class Command(BaseCommand):
    help = "Import sản phẩm từ scripts/data/products.json vào database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-existing",
            action="store_true",
            default=True,
            help="Bỏ qua sản phẩm đã tồn tại theo slug (mặc định: True)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Chạy thử, không ghi vào database",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        skip_existing = options["skip_existing"]

        if not JSON_FILE.exists():
            self.stderr.write(f"File not found: {JSON_FILE}")
            return

        MEDIA_PRODUCTS.mkdir(parents=True, exist_ok=True)

        data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
        self.stdout.write(f"Loaded {len(data)} products from JSON\n")

        # Load category map từ DB
        cat_db = {c.slug: c for c in Category.objects.all()}

        created = skipped = errors = 0

        for item in data:
            name = item.get("name", "").strip()
            if not name:
                continue

            # Slug
            slug = item.get("slug") or django_slugify(vi_to_ascii(name))

            # Kiểm tra tồn tại
            if skip_existing and Product.objects.filter(slug=slug).exists():
                self.stdout.write(f"  [SKIP] {slug}")
                skipped += 1
                continue

            # Tim category
            cat_key = normalize_category_key(item.get("category", ""))
            cat_slug = CATEGORY_MAP.get(cat_key)
            category = cat_db.get(cat_slug) if cat_slug else None
            if not category:
                category = next(iter(cat_db.values()))
                self.stdout.write(f"  [WARN] No category map for '{item.get('category')}' -> fallback")

            # Giá
            price, sale_price = make_price(category.slug)

            # Mô tả
            desc_vi = item.get("description", "").strip()
            desc_en = make_desc_en(name, category.slug, desc_vi)
            usage_vi = USAGE_VI.get(category.slug, "Sử dụng theo hướng dẫn trên bao bì sản phẩm.")
            guide_vi = GUIDE_VI.get(category.slug, "Tham khảo cán bộ kỹ thuật để được hỗ trợ.")

            # Specs
            specs_vi = {}
            specs_en = {}
            for row in item.get("specs", []):
                k = row.get("key", "").strip()
                v = row.get("value", "").strip()
                if k and v:
                    specs_vi[k] = v
                    specs_en[k] = v  # giữ nguyên vì là đơn vị/kỹ thuật

            # Tên tiếng Anh
            name_en = make_name_en(name)

            if dry_run:
                self.stdout.write(
                    f"  [DRY] {slug} | cat={category.slug} | price={price:,} | imgs={len(item.get('images',[]))}"
                )
                created += 1
                continue

            # Thumbnail
            thumbnail_path = ""
            thumb_src = item.get("thumbnail", "")
            if thumb_src:
                thumb_filename = Path(thumb_src).name
                thumb_relative = copy_and_rename_image(thumb_filename, slug, MEDIA_PRODUCTS)
                if thumb_relative:
                    thumbnail_path = thumb_relative

            # Tạo Product
            product, was_created = Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "name_en": name_en,
                    "category": category,
                    "price": price,
                    "sale_price": sale_price,
                    "description": desc_vi,
                    "description_en": desc_en,
                    "short_desc_en": desc_en[:200],
                    "usage": usage_vi,
                    "guide": guide_vi,
                    "specs": specs_vi,
                    "specs_en": specs_en,
                    "thumbnail": thumbnail_path,
                    "is_active": True,
                    "sort_order": 0,
                },
            )

            # Ảnh gallery — chỉ import nếu sản phẩm mới tạo
            if was_created:
                img_order = 0
                seen_files = set()
                for img_relative in item.get("images", []):
                    img_filename = Path(img_relative).name
                    if img_filename in seen_files:
                        continue
                    seen_files.add(img_filename)
                    new_relative = copy_and_rename_image(img_filename, slug, MEDIA_PRODUCTS)
                    if new_relative:
                        ProductImage.objects.create(
                            product=product,
                            image=new_relative,
                            order=img_order,
                        )
                        img_order += 1

            status = "CREATED" if was_created else "UPDATED"
            img_count = ProductImage.objects.filter(product=product).count()
            self.stdout.write(f"  [{status}] {slug} | {category.slug} | {price:,} VND | {img_count} imgs")
            created += 1

        self.stdout.write(
            f"\nDone: {created} processed, {skipped} skipped, {errors} errors"
        )
