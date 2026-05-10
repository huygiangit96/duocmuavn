"""
Crawl toàn bộ sản phẩm từ duocmua.vn
Output:
  scripts/data/products.json   — dữ liệu sản phẩm
  scripts/data/images/         — ảnh đã download
"""

import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = "https://www.duocmua.vn"
LIST_URL = f"{BASE_URL}/vn/sanpham/"
OUT_DIR = Path(__file__).parent / "data"
IMG_DIR = OUT_DIR / "images"
OUT_DIR.mkdir(exist_ok=True)
IMG_DIR.mkdir(exist_ok=True)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", text)
    text = re.sub(r"[èéẹẻẽêềếệểễ]", "e", text)
    text = re.sub(r"[ìíịỉĩ]", "i", text)
    text = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", text)
    text = re.sub(r"[ùúụủũưừứựửữ]", "u", text)
    text = re.sub(r"[ỳýỵỷỹ]", "y", text)
    text = re.sub(r"đ", "d", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def safe_filename(url: str) -> str:
    """Lấy tên file từ URL, giữ extension."""
    path = urllib.parse.urlparse(url).path
    name = path.split("/")[-1]
    name = urllib.parse.unquote(name)
    return re.sub(r"[^\w.\-]", "_", name)


def download_image(url: str, dest_dir: Path) -> str | None:
    """Download ảnh, trả về tên file đã lưu (relative)."""
    try:
        filename = safe_filename(url)
        dest = dest_dir / filename
        if dest.exists():
            return f"images/{filename}"
        headers = {"User-Agent": "Mozilla/5.0"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            dest.write_bytes(resp.read())
        print(f"    OK {filename}")
        return f"images/{filename}"
    except Exception as e:
        print(f"    FAIL {url}: {e}")
        return None


def extract_product(page, url: str) -> dict:
    """Truy cập trang detail, trích xuất thông tin sản phẩm."""
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(1)

    data = page.evaluate("""() => {
        // === IMAGES: gallery riêng của sản phẩm ===
        const seen = new Set();
        const images = [];
        document.querySelectorAll('#cpnimgs img').forEach(img => {
            const src = img.src;
            if (src && !seen.has(src)) { seen.add(src); images.push(src); }
        });

        // === INFO COLUMN: col-md-6 chứa h2 tên sản phẩm ===
        const infoCol = [...document.querySelectorAll('.col-md-6')].find(c => c.querySelector('h2'));

        // Tên
        const name = infoCol?.querySelector('h2')?.innerText?.trim() || '';

        // Mô tả — các thẻ p trong cột info
        const description = [...(infoCol?.querySelectorAll('p') || [])]
            .map(p => p.innerText.trim()).filter(Boolean).join('\\n');

        // Bảng thông số (Hình thức / Khối lượng)
        const specs = [];
        let isHeader = true;
        (infoCol || document).querySelectorAll('table tr').forEach(tr => {
            const cells = [...tr.querySelectorAll('td, th')].map(c => c.innerText.trim());
            if (isHeader) { isHeader = false; return; } // bỏ header row
            if (cells.length >= 2 && cells[0] && cells[1]) {
                specs.push({ key: cells[0], value: cells[1] });
            }
        });

        // === CATEGORY: link đầu tiên trong hero section ===
        const heroEl = document.querySelector('[class*="hero"] a, [class*="hero"] span, [class*="banner"] a');
        const category = heroEl ? heroEl.innerText.trim() : '';

        return { name, description, specs, images, category };
    }""")

    return data or {}


def get_product_list(page) -> list[dict]:
    """Lấy danh sách 25 sản phẩm từ trang listing."""
    page.goto(LIST_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)

    items = page.evaluate("""() => {
        const items = [...document.querySelectorAll('.item-product')];
        return items.map(item => {
            const a = item.querySelector('a[href*="chitietsanpham"]');
            const nameEl = item.querySelector('h3');
            const imgEl = item.querySelector('img');
            return {
                url: a ? a.href.replace('#main-section', '') : '',
                name: nameEl ? nameEl.innerText.trim() : '',
                thumbnail: imgEl ? imgEl.src : ''
            };
        }).filter(d => d.url);
    }""")

    return items


def main():
    products = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers({"Accept-Language": "vi-VN,vi;q=0.9"})

        print("Dang lay danh sach san pham...")
        product_list = get_product_list(page)
        print(f"   Tim thay {len(product_list)} san pham\n")

        for i, item in enumerate(product_list, 1):
            url = item["url"]
            name = item["name"] or f"product-{i}"
            print(f"[{i:02d}/{len(product_list)}] {name}")
            print(f"    URL: {url}")

            try:
                detail = extract_product(page, url)
            except Exception as e:
                print(f"    FAIL loi: {e}")
                detail = {}

            # Merge data
            final_name = detail.get("name") or name
            slug_from_url = url.rstrip("/").split("/chitietsanpham/")[-1]
            slug = urllib.parse.unquote(slug_from_url)

            # Download ảnh
            thumbnail_local = None
            if item["thumbnail"]:
                thumbnail_local = download_image(item["thumbnail"], IMG_DIR)

            detail_images_local = []
            for img_url in detail.get("images", []):
                local = download_image(img_url, IMG_DIR)
                if local:
                    detail_images_local.append(local)

            product = {
                "name": final_name,
                "slug": slugify(final_name),
                "slug_original": slug,
                "category": detail.get("category", ""),
                "subtitle": detail.get("subtitle", ""),
                "description": detail.get("description", ""),
                "specs": detail.get("specs", []),
                "thumbnail": thumbnail_local,
                "images": detail_images_local,
                "source_url": url,
            }
            products.append(product)
            print(f"    DONE — {len(detail_images_local)} anh")
            time.sleep(0.5)

        browser.close()

    # Lưu JSON
    out_file = OUT_DIR / "products.json"
    out_file.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nXong! Da luu {len(products)} san pham -> {out_file}")
    print(f"   Anh -> {IMG_DIR}")


if __name__ == "__main__":
    main()
