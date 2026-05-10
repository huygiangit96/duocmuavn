"""
Crawl toàn bộ tin tức từ duocmua.vn
Output:
  scripts/data/news.json        — dữ liệu tin tức
  scripts/data/news_images/     — ảnh đã download
"""

import html as html_module
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = "https://www.duocmua.vn"
LIST_URL = f"{BASE_URL}/vn/tintuc"
OUT_DIR = Path(__file__).parent / "data"
IMG_DIR = OUT_DIR / "news_images"
OUT_DIR.mkdir(exist_ok=True)
IMG_DIR.mkdir(exist_ok=True)


def safe_filename(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    name = path.split("/")[-1]
    name = urllib.parse.unquote(name)
    return re.sub(r"[^\w.\-]", "_", name)


def encode_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    # decode first to avoid double-encoding (%20 -> %2520)
    decoded_path = urllib.parse.unquote(parsed.path)
    encoded_path = urllib.parse.quote(decoded_path)
    return urllib.parse.urlunparse(parsed._replace(path=encoded_path))


def download_image(url: str, dest_dir: Path) -> str | None:
    try:
        filename = safe_filename(url)   # filename from original url (unquoted inside)
        request_url = encode_url(url)  # properly encoded url for HTTP request
        dest = dest_dir / filename
        if dest.exists():
            return f"news_images/{filename}"
        headers = {"User-Agent": "Mozilla/5.0"}
        req = urllib.request.Request(request_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            dest.write_bytes(resp.read())
        print(f"    OK {filename}")
        return f"news_images/{filename}"
    except Exception as e:
        print(f"    FAIL {url}: {e}")
        return None


def get_article_list(page) -> list[dict]:
    page.goto(LIST_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)

    items = page.evaluate("""() => {
        const seen = new Set();
        const results = [];

        document.querySelectorAll('a[href*="chitiettintuc"]').forEach(a => {
            const url = a.href.replace(/#.*$/, '');
            if (seen.has(url)) return;

            const card = a.closest('li, article, .item, .row, div') || a.parentElement;
            const titleEl = card?.querySelector('h1,h2,h3,h4,h5,.title');
            const title = titleEl?.innerText?.trim() || a.innerText?.trim();

            if (!title || title.length < 5) return;

            const dateEl = card?.querySelector('[class*="date"],[class*="time"],time,span');
            const date = dateEl?.innerText?.trim() || '';

            // thumbnail: try multiple strategies
            const slug = url.split('/').pop();
            // 1. img inside a link pointing to same article
            const linkedImg = document.querySelector(`a[href*="${slug}"] img`);
            // 2. img inside card
            const cardImg = card?.querySelector('img');
            // 3. img in closest parent that has an img sibling
            const parentImg = a.parentElement?.parentElement?.querySelector('img');
            const thumbnail = linkedImg?.src || cardImg?.src || parentImg?.src
                || linkedImg?.getAttribute('data-src') || cardImg?.getAttribute('data-src') || '';

            seen.add(url);
            results.push({ url, title, date, thumbnail });
        });

        return results;
    }""")

    return items or []


def extract_article(page, url: str) -> dict:
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(1)

    data = page.evaluate("""() => {
        // Category from breadcrumb
        const heroLink = document.querySelector('[class*="hero"] a, [class*="banner"] a, [class*="breadcrumb"] a');
        const category = heroLink ? heroLink.innerText.trim() : '';

        // Content container
        const container = document.querySelector('.row.detail_tintuc');
        const content_html = container ? container.innerHTML : '';

        // Collect all images from page (both in content and general media)
        const imgs = [];
        const seen = new Set();

        // First: images inside content container
        if (container) {
            container.querySelectorAll('img').forEach(img => {
                const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy') || '';
                if (src && !seen.has(src)) {
                    seen.add(src);
                    imgs.push(src);
                }
            });
        }

        // Then: all /media/ images on page (covers hero/banner thumbnails)
        document.querySelectorAll('img').forEach(img => {
            const src = img.src || img.getAttribute('data-src') || '';
            if (src && src.includes('/media/') && !src.includes('logo') && !src.includes('Layout') && !seen.has(src)) {
                seen.add(src);
                imgs.push(src);
            }
        });

        return { category, content_html, images: imgs };
    }""")

    return data or {}


def parse_slug(url: str) -> str:
    slug = url.rstrip("/").split("/chitiettintuc/")[-1]
    return urllib.parse.unquote(slug)


def main():
    articles = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers({"Accept-Language": "vi-VN,vi;q=0.9"})

        print("Dang lay danh sach bai viet...")
        article_list = get_article_list(page)
        print(f"   Tim thay {len(article_list)} bai viet\n")

        for i, item in enumerate(article_list, 1):
            url = item["url"]
            title = html_module.unescape(item["title"])
            print(f"[{i:02d}/{len(article_list)}] {title[:60]}")
            print(f"    URL: {url}")

            try:
                detail = extract_article(page, url)
            except Exception as e:
                print(f"    FAIL: {e}")
                detail = {}

            slug = parse_slug(url)

            # Download thumbnail from listing page
            thumbnail_local = None
            if item.get("thumbnail"):
                thumbnail_local = download_image(item["thumbnail"], IMG_DIR)

            # Download all detail images
            detail_images_local = []
            img_url_to_local: dict[str, str] = {}
            for img_url in detail.get("images", []):
                local = download_image(img_url, IMG_DIR)
                if local:
                    detail_images_local.append(local)
                    img_url_to_local[img_url] = local

            # Fallback: use first detail image as thumbnail if listing had none
            if not thumbnail_local and detail_images_local:
                thumbnail_local = detail_images_local[0]
                print(f"    thumbnail fallback -> {thumbnail_local}")

            article = {
                "title": title,
                "slug": slug,
                "date": item.get("date", ""),
                "category": detail.get("category", ""),
                "content_html": detail.get("content_html", ""),
                "img_url_map": img_url_to_local,
                "thumbnail": thumbnail_local,
                "images": detail_images_local,
                "source_url": url,
            }
            articles.append(article)
            print(f"    DONE — {len(detail_images_local)} imgs, thumb={'yes' if thumbnail_local else 'NO'}")
            time.sleep(0.5)

        browser.close()

    out_file = OUT_DIR / "news.json"
    out_file.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nXong! Da luu {len(articles)} bai viet -> {out_file}")
    print(f"   Anh -> {IMG_DIR}")


if __name__ == "__main__":
    main()
