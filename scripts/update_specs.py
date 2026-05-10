"""
Cập nhật specs của sản phẩm:
  - Lấy thành phần hoạt chất từ trường description
  - Lưu vào specs dạng {"Tên hoạt chất": "Hàm lượng"}
"""

import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import django
django.setup()

from apps.products.models import Product


UNIT_PATTERN = r'\d+\.?\d*\s*(?:g/[Ll]|g/kg|ml/[Ll]|%|w/w|v/v)'

def parse_ingredients(description: str) -> dict:
    """
    Trích xuất thành phần hoạt chất từ description.
    Xử lý các dạng:
      - "Tên hoạt chất: 16%"
      - "Tên hoạt chất: 100g/L" / "Tên hoạt chất 100g/kg"
      - "Mô tả dài... Hoạt chất: Hexaconazole: 5% SC"  (embedded)
    """
    specs = {}
    lines = description.split('\n')

    for line in lines:
        line = line.strip().rstrip('.')
        if not line:
            continue

        # Bỏ qua dòng không có đơn vị hàm lượng
        if not re.search(UNIT_PATTERN, line, re.IGNORECASE):
            continue

        # Dạng embedded: "...Hoạt chất: TênHoạtChất: Hàmlượng"
        # Trích phần sau "Hoạt chất:" rồi xử lý tiếp
        embedded = re.search(r'hoạt chất\s*:\s*(.+)', line, re.IGNORECASE)
        if embedded:
            line = embedded.group(1).strip().rstrip('.')

        # Bỏ qua header thuần (không có số sau khi strip)
        if re.search(r'^(thành phần|hoạt chất|thành phan)', line, re.IGNORECASE):
            if not re.search(r'\d', line):
                continue

        # Bỏ qua dòng mô tả quá dài (> 60 ký tự sau khi đã strip embedded)
        if len(line) > 60:
            continue

        # Tách: "Tên: Hàm lượng" hoặc "Tên Hàm lượng"
        m = re.match(
            r'^(.+?)\s*:?\s*(' + UNIT_PATTERN + r'[^,\n]{0,15})$',
            line, re.IGNORECASE
        )
        if m:
            name = m.group(1).strip().rstrip(':').strip()
            value = m.group(2).strip()
            if len(name) >= 2 and not re.match(r'^\d+$', name):
                specs[name] = value

    return specs


def main():
    products = Product.objects.exclude(description='')
    updated = 0
    skipped = 0

    for product in products:
        new_specs = parse_ingredients(product.description)

        if not new_specs:
            print(f'  [SKIP] {product.slug} — khong tim thay hoat chat')
            skipped += 1
            continue

        # Cập nhật specs và specs_en (giữ nguyên key/value vì là thuật ngữ kỹ thuật)
        product.specs = new_specs
        product.specs_en = new_specs
        product.save(update_fields=['specs', 'specs_en'])

        print(f'  [OK] {product.slug}')
        for k, v in new_specs.items():
            print(f'       {k}: {v}')
        updated += 1

    print(f'\nXong: {updated} cap nhat, {skipped} bo qua')


if __name__ == '__main__':
    main()
